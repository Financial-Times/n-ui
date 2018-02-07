const oTracking = require('o-tracking');
const oGrid = require('o-grid');
const oViewport = require('o-viewport');
const nextEvents = require('./next-events');


import {broadcast} from 'n-ui-foundations';


function nodesToArray (nodelist) {
	return [].slice.call(nodelist);
}

function getRootData (name) {
	return document.documentElement.getAttribute(`data-${name}`);
}

function findInQueryString (name) {
	let exp = new RegExp(`[?&]${name}=([^?&]+)`);
	return (String(window.location.search).match(exp) || [])[1];
}

const oTrackingWrapper = {
	init: function (flags, appInfo) {

		if (!flags || !flags.get('oTracking')) {
			return;
		}

		// oTracking sometimes errors - this makes sure that if it does it won't bring the whole bootstrap process down with it
		try {
			const userData = {
				layout: oGrid.getCurrentLayout(),
				orientation: oViewport.getOrientation()
			};

			const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

			if (connection && connection.type) {
				userData.connectionType = connection.type;
			}

			const context = {
				product: appInfo && appInfo.product || 'next',
				app: appInfo && appInfo.name,
				appVersion: appInfo && appInfo.version
			};

			const contentId = getRootData('content-id');
			if (contentId) {
				context.rootContentId = contentId;
			}

			const conceptId = getRootData('concept-idv1') || getRootData('concept-id');
			if (conceptId) {
				context.rootConceptId = conceptId;
				context.rootConceptIdV1 = getRootData('concept-idv1');
				context.rootTaxonomy = getRootData('taxonomy');
			}

			const errorStatus = (/nextErrorStatus=(\d{3})/.exec(window.location.search) || [])[1];
			const errorReason = (/nextErrorReason=(\w+)/.exec(window.location.search) || [])[1];
			const pageViewConf = {context: {}};

			if (errorStatus) {
				// TODO after https://github.com/Financial-Times/o-tracking/issues/122#issuecomment-194970465
				// this should be redundant as context would propagate down to each event in its entirety
				context.url = pageViewConf.context.url = window.parent.location.toString();
				context.referrer = pageViewConf.context.referrer = window.parent.document.referrer;
				context.errorStatus = pageViewConf.context.errorStatus = errorStatus;

				if (errorReason) {
					context.errorReason = pageViewConf.context.errorReason = errorReason;
				}
			}

			const edition = document.querySelector('[data-next-edition]');
			if (edition) {
				context.edition = edition.getAttribute('data-next-edition');
			}

			const segmentId = findInQueryString('segmentId');
			if (segmentId) {
				context['marketing_segment_id'] = segmentId;
			}

			const cpcCampaign = findInQueryString('cpccampaign');
			if (cpcCampaign) {
				context['cpc_campaign'] = cpcCampaign;
			}

			const pageMeta = window.FT && window.FT.pageMeta;
			if (pageMeta && (pageMeta === Object(pageMeta))) {
				for (let key in pageMeta) {
					if (pageMeta.hasOwnProperty(key)) {
						context[key] = pageMeta[key];
					}
				}
			}

			const abState = getRootData('ab-state');
			if (abState) {
				let ammitAllocations = abState;

				if (abState !== '-') {
					ammitAllocations = {};
					abState.split(',').map(flag => {
						const [name, value] = flag.split(':');
						ammitAllocations[name] = value;
					});
				}

				context['active_ammit_flags'] = ammitAllocations;
			}

			oTracking.init({
				server: 'https://spoor-api.ft.com/ingest',
				context: context,
				user: userData,
				useSendBeacon: flags.get('sendBeacon')
			});

			//headline testing, add variant to the page view event as long as there is only one article under test
			if (location.pathname === '/') {
				const alternativeHeadlines = [].slice.call(document.querySelectorAll('[data-trackable-context-headline-variant]'));
				const isOnlyOneArticle = alternativeHeadlines.every((element, index, array) => element.getAttribute('href') === array[0].getAttribute('href'));
				if (alternativeHeadlines.length && isOnlyOneArticle) {
					pageViewConf.context['headline-variant'] = alternativeHeadlines[0].getAttribute('data-trackable-context-headline-variant');
					const articleUuid = alternativeHeadlines[0].getAttribute('href').replace('/content/', '');
					pageViewConf.context['headline-uuid'] = articleUuid;
				}
			}

			// barriers
			let barrierType = document.querySelector('[data-barrier]');
			let productSelectorFlag = document.querySelector('[data-barrier-is-product-selector]');

			if (barrierType) {
				pageViewConf.context.barrier = true;
				pageViewConf.context.barrierType = barrierType.getAttribute('data-barrier');
			};

			// FIXME - should not fire on barriers, but needs to be around for a while data analytics fix their SQL
			// Page view must not be triggered in any form of frameset, only a genuine page view, or the error page domain, as error pages are served in iframes.
			if(window === window.top || window.location.hostname === 'errors-next.ft.com') {
				oTracking.page(pageViewConf.context);
			}

			if (barrierType) {

				const isProductSelector = (productSelectorFlag) ? productSelectorFlag.getAttribute('data-barrier-is-product-selector') === 'true' : false;

				// https://docs.google.com/document/d/18_yV2s813XCrBF7w6196FLhLJzWXK4hXT2sIpDZVvhQ/edit?ts=575e9368#
				const opportunity = {
					type: (isProductSelector) ? 'products' : 'barrier',
					subtype: barrierType.getAttribute('data-opportunity-subtype') || barrierType.getAttribute('data-barrier')
				};

				const offers = document.querySelectorAll('[data-offer-id]');
				const acquisitionContext = document.querySelectorAll('[data-acquisition-context]');
				const messaging = barrierType.getAttribute('data-barrier-messaging');

				const barrierReferrer = (/barrierReferrer=(\w+)/.exec(window.location.search) || [])[1];

				broadcast('oTracking.event', Object.assign({
					category: 'barrier',
					action: 'view',
					opportunity: opportunity,
					barrierReferrer: barrierReferrer,
					type: barrierType.getAttribute('data-barrier'),
					commsType: messaging,
					acquisitionContext: nodesToArray(acquisitionContext).map(e => e.getAttribute('data-acquisition-context')),
					offers: nodesToArray(offers).map(e => e.getAttribute('data-offer-id'))
				}, context));
			}

		} catch (err) {
			broadcast('oErrors.log', {
				error: err,
				info: {
					message: 'Failed to init o-tracking'
				}
			});
		}

		nextEvents.init();
	}
};

module.exports = oTrackingWrapper;
