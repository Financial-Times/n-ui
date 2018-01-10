/**
 * The awesome (we think it is!) LUX is SpeedCurve's RUM (Real User Monitoring) product.
 * https://speedcurve.com/features/lux/
 *
 * We (mainly Next developers) hope to use this product to help improve
 * web performance and hopefully more.
 */

import loadScript from '../load-script';
import inlineCode from './inline-code';

module.exports = (flags) => {
	if (flags.get('speedcurveLux')) {
		// run some Speedcurve LUX-supplied inline code
		inlineCode();
		// if this gets fewer than 10 million visitors every month, then we're fine with having a sample rate of 100.
		window.LUX.samplerate = 100;
		// the LUX ID is from https://speedcurve.com/ft/next-dev/admin/teams/
		const luxId = 55181267;
		loadScript(`//cdn.speedcurve.com/js/lux.js?id=${luxId}`);
	}
};
