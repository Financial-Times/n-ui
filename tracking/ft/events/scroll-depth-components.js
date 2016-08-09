const broadcast = require('../../../utils').broadcast;

const track = (componentId, componentPos) =>
	broadcast('oTracking.event', { category: 'page', action: 'scrolldepth', componentId, componentPos });

const intersectionCallback = (observer, changes) =>
	changes.forEach(change => {
		const component = change.target;
		const componentId = component.id;
		// get the component's position
		const componentPos = [...document.querySelectorAll('.js-track-scroll-event')]
			.findIndex(component => component.id === componentId);
		track(componentId, componentPos + 1);
		observer.unobserve(component);
	});

const init = () => {
	if (!/spoor-id=0/.test(document.cookie) || !window.IntersectionObserver) {
		return false;
	}
	const observer = new IntersectionObserver(
		function (changes) {
			intersectionCallback(this, changes);
		}
	);
	[...document.querySelectorAll('.js-track-scroll-event')]
		.forEach(component => {
			observer.observe(component);
		});
}

export default { init }
