/**
 * The awesome (we think it is!) LUX is SpeedCurve's RUM (Real User Monitoring) product.
 * https://speedcurve.com/features/lux/
 *
 * We (mainly Next developers) hope to use this product to help improve
 * web performance and hopefully more.
 */

import loadScript from './load-script';

module.exports = (flags) => {
	if (flags.get('speedcurveLux')) {
		// https://speedcurve.com/features/lux/#snippet
		window.LUX = {
			samplerate: 100
		};
		// the LUX ID is from https://speedcurve.com/ft/next-dev/admin/teams/
		const luxId = 55181267;
		loadScript(`//cdn.speedcurve.com/js/lux.js?id=${luxId}`);
	}
};
