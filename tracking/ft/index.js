const oTracking = require('o-tracking');
const oGrid = require('o-grid');
const oViewport = require('o-viewport');
const nextEvents = require('./next-events');

import {broadcast} from '../../utils'


function nodesToArray (nodelist) {
	return [].slice.call(nodelist);
}

function getRootData (name) {
	return document.documentElement.getAttribute(`data-${name}`);
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
				product: 'next',
				app: appInfo && appInfo.name,
				appVersion: appInfo && appInfo.version
			};

			const contentId = getRootData('content-id');
			if (contentId) {
				context.rootContentId = contentId;
			}

			const conceptId = getRootData('concept-id');
			if (conceptId) {
				context.rootConceptId = conceptId;
				context.rootTaxonomy = getRootData('taxonomy');
			}

			const errorStatus = (/nextErrorStatus=(\d{3})/.exec(window.location.search) || [])[1];
			const pageViewConf = {context: {}};

			if (errorStatus) {
				// TODO after https://github.com/Financial-Times/o-tracking/issues/122#issuecomment-194970465
				// this should be redundant as context woudl propagate down to each event in its entirety
				context.url = pageViewConf.context.url = window.parent.location.toString();
				context.referrer = pageViewConf.context.referrer = window.parent.document.referrer;
				context.errorStatus = pageViewConf.context.errorStatus = errorStatus;
			}

			const edition = document.querySelector('[data-next-edition]') ? document.querySelector('[data-next-edition]').getAttribute('data-next-edition') : null;
			context.edition = edition;
			const segmentId = String(window.location.search).match(/[?&]segmentId=([^?&])/) || [];
			if (segmentId[1]) {
				context['marketing_segment_id'] = segmentId[1];
			}
			const pageMetaEl = document.querySelector('[data-page-meta]');
			let pageMeta;
			if (pageMetaEl) {
				try {
					pageMeta = JSON.parse(pageMetaEl.innerHTML);
				} catch (e) {
				}
			}
			if (pageMeta) Object.assign(context, pageMeta);

			oTracking.init({
				server: 'https://spoor-api.ft.com/ingest',
				context: context,
				user: userData,
				useSendBeacon: flags.get('sendBeacon')
			});

			// barriers
			let barrierType = document.querySelector('[data-barrier]');
			let productSelectorFlag = document.querySelector('[data-barrier-is-product-selector]');

			if (barrierType) {
				pageViewConf.context.barrier = true;
				pageViewConf.context.barrierType = barrierType.getAttribute('data-barrier');
			};

			// FIXME - should not fire on barriers, but needs to be around for a while data analytics fix their SQL
			oTracking.page(pageViewConf.context);

			if (barrierType) {

				const isProductSelector = (productSelectorFlag) ? productSelectorFlag.getAttribute('data-barrier-is-product-selector') === 'true' : false;

				// https://docs.google.com/document/d/18_yV2s813XCrBF7w6196FLhLJzWXK4hXT2sIpDZVvhQ/edit?ts=575e9368#
				const opportunity = {
					type: (isProductSelector) ? 'products' : 'barrier',
					subtype: barrierType.getAttribute('data-barrier')
				}

				const offers = document.querySelectorAll('[data-offer-id]');
				const acquisitionContext = document.querySelectorAll('[data-acquisition-context]');

				broadcast('oTracking.event', Object.assign({
					category: 'barrier',
					action: 'view',
					opportunity: opportunity,
					type: barrierType.getAttribute('data-barrier'),
					acquisitionContext: nodesToArray(acquisitionContext).map(e => e.getAttribute('data-acquisition-context')),
					offers: nodesToArray(offers).map(e => e.getAttribute('data-offer-id'))
				}, context))
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
