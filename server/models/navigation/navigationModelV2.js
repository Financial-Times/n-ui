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

// Function to support the A/B test of renaming the "Companies" section to "Business"
// This function can be removed once the test is complete.
function renameCompaniesToBusiness ( obj ) {
	if( Array.isArray(obj) ) {
		obj.forEach(renameCompaniesToBusiness);
	} else if( obj ) {
		if( obj.label ) {
			obj.label = obj.label.replace(/^Companies/, 'Business');
		}
		renameCompaniesToBusiness(obj.items);
		renameCompaniesToBusiness(obj.data);
		renameCompaniesToBusiness(obj.submenu);
		renameCompaniesToBusiness(obj.meganav);
	}
}

module.exports = class NavigationModelV2 {

	constructor (options){
		this.apiDataUrl = 'http://next-navigation.ft.com/v2/menus';
		this.apiHierarcyUrl = 'http://next-navigation.ft.com/v2/hierarchy';
		this.apiIdMapUrl = 'http://next-navigation.ft.com/v2/ids';
		this.fallbackData = require('./defaultDataV2.json');
		this.options = Object.assign({}, {withNavigationHierarchy:false}, options || {});
		this.poller = new Poller({
			url: this.apiDataUrl,
			refreshInterval: ms('15m')
		});
		this.idMapPoller = new Poller({
			url: this.apiIdMapUrl,
			refeshInterval: ms('15m')
		});
	}

	init () {
		const promises = [];
		promises.push(this.poller.start({initialRequest:true}));

		if(this.options.withNavigationHierarchy){
			promises.push(this.idMapPoller.start({initialRequest:true}));
		}

		return Promise.all(promises).catch(err => {
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
				if(!currentPathName || !/\/(products|barriers|errors)/.test(currentPathName)) {
					item.url = item.url.replace('${currentPath}', currentUrl);
				} else {
					item.url = item.url.replace('${currentPath}', '%2F');
				}
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

			if(menuName === 'navbar-simple' && !NavigationModelV2.showSimpleNav(currentUrl, menuData)){
				continue;
			}

			if(menuData && menuData !== 'footer'){
				NavigationModelV2.decorateSelected(menuData, currentUrl);
			}

			if( res.locals.flags && res.locals.flags.renameCompaniesToBusiness ) {
				renameCompaniesToBusiness(menuData);
			}

			res.locals.navigation.menus[menuName] = menuData;
		}

		if(this.options.withNavigationHierarchy){
			res.locals.navigation.idMap = this.idMapPoller.getData() || {};
			let hierarchyApiUrl = this.apiHierarcyUrl + currentUrl;
			fetch(hierarchyApiUrl)
				.then(response => {
					if(!response.ok){
						return Promise.reject({event:'NAVIGATION_HIERARCHY_FAILED', status:response.status, url:hierarchyApiUrl});
					}else{
						return response.json();
					}
				})
				.then(data => {
					// We need to add the appropriate labels to this when rendered, so mark it as selected.
					const currentItem = { ...data.item, selected: true };
					if( res.locals.flags && res.locals.flags.renameCompaniesToBusiness ) {
						renameCompaniesToBusiness(currentItem);
					}
					res.locals.navigation.showSubNav = true;
					res.locals.navigation.hierarchy = data;
					res.locals.navigation.breadcrumb = data.ancestors.concat(currentItem);
					res.locals.navigation.subsections = data.children;
				})
				.catch(e => {
					if(e.event){
						if (e.status === 404) {
							log.debug(e); // No need to log 404 as an error, as it might spam the logs
						} else {
							log.error(e);
						}
					}else{
						log.error({event:'NAVIGATION_HIERARCHY_ERROR', error:e.message});
					}
				})
				.then(next);
		}else{
			next();
		}
	}
};
