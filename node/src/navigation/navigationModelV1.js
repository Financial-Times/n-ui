const Poller = require('ft-poller');
const ms = require('ms');
const url = require('url');
const decorateSelectedLink = require('./decorate');
const HierarchyMixin = require('./hierarchyMixin');
const log = require('@financial-times/n-logger').default;

const clone = obj => JSON.parse(JSON.stringify(obj));


module.exports = class NavigationModelV1 {

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
