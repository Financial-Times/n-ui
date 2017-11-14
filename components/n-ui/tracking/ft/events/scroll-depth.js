const broadcast = require('n-ui-foundations').broadcast;
const nextEvents = require('../next-events');

const fireBeacon = (contextSource, percentage) => {
	const data = {
		action: 'scrolldepth',
		category: 'page',
		meta: {
			percentagesViewed: percentage,
			attention: nextEvents.attention.get()
		},
		context: {
			product: 'next',
			source: contextSource
		}
	};
	broadcast('oTracking.event', data);
};

const scrollDepth = {

	init: (contextSource, { percentages = [25, 50, 75, 100], selector = 'body'} = { }) => {
		if (!(contextSource && contextSource.length)) {
			throw new Error('contextSource required');
		}

		const intersectionCallback = (observer, changes) => {
			changes.forEach(change => {
				if(change.isIntersecting || change.intersectionRatio > 0) {
					const scrollDepthMarkerEl = change.target;
					fireBeacon(contextSource, scrollDepthMarkerEl.getAttribute('data-percentage'));
					if (scrollDepthMarkerEl.parentNode) {
						scrollDepthMarkerEl.parentNode.removeChild(scrollDepthMarkerEl);
					}
					observer.unobserve(scrollDepthMarkerEl);
				}
			});
		};


		const element = document.querySelector(selector);
		if (element && window.IntersectionObserver) {
			const observer = new IntersectionObserver(
				function (changes) {
					intersectionCallback(this, changes);
				}
			);
			percentages.forEach(percentage => {
				// add a scroll depth marker element
				const targetEl = document.createElement('div');
				targetEl.className = 'n-ui__scroll-depth-marker';
				targetEl.style.position = 'absolute';
				targetEl.style.top = `${percentage}%`;
				targetEl.style.bottom = '0';
				targetEl.style.width = '100%';
				targetEl.style.zIndex = '-1';
				targetEl.setAttribute('data-percentage', percentage);
				element.appendChild(targetEl);
				observer.observe(targetEl);
			});
		}
	}
};

module.exports = scrollDepth;
