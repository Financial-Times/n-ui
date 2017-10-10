// Needed by some third party scripts, otherwise they error
window.FT = window.FT || {};

// Expose entry points to shared bundle
import ads from '../../components/n-ui/ads';
import tracking from '../../components/n-ui/tracking';
import oDate from 'o-date';
import nUiFoundations from 'n-ui-foundations';
import oGrid from 'o-grid';
import viewport from 'o-viewport';
import * as nImage from 'n-image';

// Export some third party components we're unlikely to remove in a hurry
import ftdomdelegate from 'ftdomdelegate';
import superstore from 'superstore';
import superstoreSync from 'superstore-sync';

import { AppInitializer } from './app-initializer';

const { bootstrap } = new AppInitializer();

// returns {flags, allStylesLoaded, appInfo}
const nUiEnv = bootstrap(window.FT.nUiConfig || {
	preset: 'discrete'
}
window.FT.nUi = Object.assign(nUiEnv, {
	ads: ads,
	tracking: tracking,
	_hiddenComponents: {
		oDate,
		oViewport,
		nUifoundations,
		oGrid,
		nImage,
		ftdomdelegate,
		superstore,
		superstoreSync
	}
})
