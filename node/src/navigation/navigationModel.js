const Poller = require('ft-poller');
const ms = require('ms');
const url = require('url');
const decorateSelectedLink = require('./decorate');
const HierarchyMixin = require('./hierarchyMixin');
const log = require('@financial-times/n-logger').default;

const menuNameMap = new Map([
	['drawer', {uk:'drawer-uk', international:'drawer-international'}],
	['footer', 'footer'],
	['navbar-simple', 'navbar-simple'],
	['navbar-right', 'navbar-right'],
	['navbar', {uk:'navbar-uk', international:'navbar-international'}]
]);

function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
}

class NavigationModelV1 {

	constructor (options) {
		this.API_URL = 'http://next-navigation.ft.com/v1/lists';
		this.FALLBACK_URL = 'http://ft-next-navigation.s3-website-eu-west-1.amazonaws.com/json/lists.json';
		this.defaultData = require('./defaultData.json');
		this.options = Object.assign({}, {withNavigationHierarchy:false}, options || {});
		this.poller = new Poller({
			url: this.API_URL,
			refreshInterval: ms('15m')
		});
		if(this.options.withNavigationHierarchy) {
			this.hierarchy = new HierarchyMixin();
		}

	}

	init () {
		let promises = [
			this.getInitialData()
		];
		if(this.options.withNavigationHierarchy) {
			promises.push(this.hierarchy.init());
		}

		return Promise.all(promises);
	}

	getInitialData () {
		return this.poller.start({initialRequest:true}).catch(err => {
			log.error({event:'NAVIGATION_API_DOWN', message:err.message});
			return this.fallback();
		})
	}

	fallback () {
		return fetch(this.FALLBACK_URL)
			.then(response => {
				if(!response.ok) {
					log.error({event:'FALLBACK_URL_FAILURE', url:this.FALLBACK_URL, status:response.status});
					return this.defaultData;
				}

				log.info({event:'NAVIGATION_LISTS_USING_S3_BUCKET'});
				return response.json();
			})
			.then(data => {
				this.fallbackData = data;
			})
			.catch(err => {
				log.error({event:'FALLBACK_URL_FAILURE', url:this.FALLBACK_URL, error:err.message, stack:err.stack.replace(/\n/g, '; ')});
				this.fallbackData = this.defaultData;
			})
	}

	getData () {
		return this.poller.getData() || this.fallbackData;
	}

	list (name) {
		let data = this.getData();
		if(!data) {
			throw new Error('No lists data loaded');
		}

		if(!data[name]) {
			throw new Error(`No list with name '${name}' found`);
		}

		return clone(data[name]);
	}

	static showMobileNav (currentUrl, navData) {
		const currentPathName = url.parse(currentUrl).pathname;
		for(let item of navData) {
			if(currentPathName === item.href || (item.id && currentUrl.includes(item.id))) {
				return true;
			}
		}

		return false;
	}

	middleware (req, res, next) {
		let currentEdition = res.locals.editions.current.id;
		res.locals.navigation = {
			lists: {}
		};
		res.locals.navigationLists = {};

		const currentUrl = req.get('ft-blocked-url') || req.get('FT-Vanity-Url') || req.url;

		let data = this.getData();
		if(!data) {
			next();
			return;
		}


		for (let listName of Object.keys(data)) {

			// not really a list
			// tood: remove meganav from data returned by api
			if(listName === 'meganav') {
				continue;
			}

			// mobile nav only on homepage
			if(listName === 'navbar_mobile' && !NavigationModelV1.showMobileNav(currentUrl, data[listName][currentEdition])) {
				continue;
			}

			let listData = this.list(listName);

			// List data could be an object with arrays for each edition, or just an array if the same for every edition
			if(!Array.isArray(listData)) {
				listData = listData[currentEdition] || listData;
			}

			if (listName !== 'footer') {
				decorateSelectedLink(listData, currentUrl);
			}

			res.locals.navigation.lists[listName] = listData;

			// I think the form above is better as it keeps things in a "navigation" namespace
			// keeping this for legacy support
			// todo: remove this when it's no longer useds
			res.locals.navigationLists[listName] = listData;
		}

		// take the actual path rather than a vanity
		if (this.options.withNavigationHierarchy && /^\/stream\//.test(req.path)) {
			const regexResult = /stream\/(.+)Id\/(.+)/i.exec(req.path);
			if(regexResult && regexResult.length === 3) {
				let id = regexResult[2];
				res.locals.navigation.currentItem = this.hierarchy.find(id).item;
				res.locals.navigation.ancestors = this.hierarchy.ancestors(id);
				res.locals.navigation.children = this.hierarchy.children(id);
			}
		}

		next();
	}
};

class NavigationModelV2 {

	constructor (options){
		this.apiDataUrl = 'http://next-navigation.ft.com/v2/menus';
		this.apiHierarcyUrl = 'http://next-navigation.ft.com/v2/hierarchy';
		this.fallbackData = require('./defaultDataV2.json');
		this.options = Object.assign({}, {withNavigationHierarchy:false}, options || {});
		this.poller = new Poller({
			url: this.apiDataUrl,
			refreshInterval: ms('15m')
		});
	}

	init () {
		return this.poller.start({initialRequest:true}).catch(err => {
			log.error({event:'NAVIGATION_API_DOWN', message:err.message});
		});
	}

	get data () {
		return clone(this.poller.getData() || this.fallbackData);
	}

	static showSimpleNav (currentUrl, navData) {
		const currentPathName = url.parse(currentUrl).pathname;
		for(let item of navData.items) {
			if(currentPathName === item.url) {
				return true;
			}
		}

		return false;
	}

	static decorateSelected (navData, currentUrl){
		const currentPathName = url.parse(currentUrl).pathname;
		for(let item of navData.items){
			if(item.url === currentPathName){
				item.selected = true;
				return;
			}

			if(item.submenu){
				NavigationModelV2.decorateSelected(item.submenu, currentUrl);
			}
		}
	}

	middleware (req, res, next) {
		let currentEdition = res.locals.editions.current.id;
		res.locals.navigation = {
			menus: {}
		};

		const currentUrl = req.get('ft-blocked-url') || req.get('FT-Vanity-Url') || req.url;

		let data = this.data;
		if(typeof data === 'string'){
			data = JSON.parse(data);
		}

		if(!data) {
			next();
			return;
		}

		for(let [menuName, menuSource] of menuNameMap){
			let menuData = typeof menuSource === 'object' ? data[menuSource[currentEdition]] : data[menuSource];
			if(!menuData){
				log.info({event:'NO_NAVIGATION_DATA', menu:menuName});
				continue;
			}

			if(menuName === 'navbar-simple' && NavigationModelV2.showSimpleNav(currentUrl, menuData)){
				continue;
			}

			if(menuData && menuData !== 'footer'){
				NavigationModelV2.decorateSelected(menuData, currentUrl)
			}

			res.locals.navigation.menus[menuName] = menuData;
		}

		if(this.options.withNavigationHierarchy){
			let hierarcyApiUrl = this.apiHierarcyUrl + currentUrl;
			fetch(hierarcyApiUrl)
				.then(response => {
					if(!response.ok){
						return Promise.reject({event:'NAVIGATION_HIERARCHY_FAILED', status:response.status, url:hierarcyApiUrl});
					}else{
						return response.json();
					}
				})
				.then(data => {
					res.locals.navigation.hierarchy = data;
				})
				.catch(e => {
					if(e.event){
						log.error(e)
					}else{
						log.error({event:'NAVIGATION_HIERARCHY_ERROR', error:e.message});
					}
				})
				.then(next);
		}else{
			next();
		}
	}
}

let navigationModelV1;
let navigationModelV2;

module.exports = {
	NavigationModelV1,
	NavigationModelV2,
	init: options => {
		navigationModelV1 = new NavigationModelV1(options);
		navigationModelV2 = new NavigationModelV2(options);

		return Promise.all([navigationModelV1.init(), navigationModelV2.init()]);
	},
	middleware : (req, res, next) => {
		if(res.locals.flags.origamiNavigation){
			return navigationModelV2.middleware(req, res, next);
		}else{
			return navigationModelV1.middleware(req, res, next);
		}
	}
}
