/* globals FontFaceObserver */
require('fontfaceobserver/fontfaceobserver.standalone.js');

const fontLoadedPrefix = 'o-typography--loaded-';
const fontLoadedCookieName = 'next-fonts-loaded';
const fontConfigs = [
	{
		family: 'FinancierDisplayWeb',
		weight: 'normal',
		labels: ['serifDisplay']
	},
	{
		family: 'MetricWeb',
		weight: 'normal',
		labels: ['sans', 'sansData']
	},
	{
		family: 'MetricWeb',
		weight: 600,
		labels: ['sansDataBold']
	}
];

export function load (el) {
	if (new RegExp(`(^|\\s)${fontLoadedCookieName}=1(;|$)`).test(document.cookie)) {
		return Promise.resolve();
	}
	const fontPromises = fontConfigs.map(fontConfig => {
		new FontFaceObserver(fontConfig.family, { weight: fontConfig.weight })
			.load()
			.then(() =>
				el.className += fontConfig.labels.reduce(
					(classes, label) => classes += ` ${fontLoadedPrefix}${label}`, ''
				)
			);
	});

	return Promise.all(fontPromises)
		.then(() => {
			// set cookie for subsequent visits
			document.cookie = `${fontLoadedCookieName}=1;domain=.ft.com;path=/;max-age=${60 * 60 * 24 * 7}`;
			// create a performance mark
			const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
			if (performance && performance.mark) {
				performance.mark('fontsLoaded');
			}
		})
		.catch(() => { });
};
