const Poller = require('ft-poller');
const ms = require('ms');
const url = require('url');
const log = require('@financial-times/n-logger').default;

const menuNameMap = new Map([
	['drawer', {uk:'drawer-uk', international:'drawer-international'}],
	['footer', 'footer'],
	['navbar-simple', 'navbar-simple'],
	['navbar-right', 'navbar-right'],
	['navbar-right-anon', 'navbar-right-anon'],
	['navbar', {uk:'navbar-uk', international:'navbar-international'}],
	['user', 'user'],
	['anon', 'anon']
]);

const clone = obj => JSON.parse(JSON.stringify(obj));

module.exports = class NavigationModelV2 {

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
		return this.poller.start({initialRequest:true})
			.catch(err => {
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
			if(typeof item.url === 'string' && item.url.includes('${currentPath}')){
				item.url = item.url.replace('${currentPath}', currentUrl);
			}

			if(item.url === currentPathName){
				item.selected = true;
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
			log.info({event:'NAVIGATION_HIERARCHY_ENABLED'});
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
					res.locals.navigation.showSubNav = true;
					res.locals.navigation.hierarchy = data;
					res.locals.navigation.breadcrumb = data.ancestors.concat([data.item]);
					res.locals.navigation.subsections = data.children;
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
			log.info({event:'NAVIGATION_HIERARCHY_DISABLED'});
			next();
		}
	}
}
