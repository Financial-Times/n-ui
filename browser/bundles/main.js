// Expose entry points to shared bundle
import ads from '../../components/n-ui/ads';
import tracking from '../../components/n-ui/tracking';
import oDate from 'o-date';
import nUiFoundations from 'n-ui-foundations';
import oGrid from 'o-grid';
import oViewport from 'o-viewport';
import * as nImage from 'n-image';

// Export some third party components we're unlikely to remove in a hurry
import ftdomdelegate from 'ftdomdelegate';
import superstore from 'superstore';
import superstoreSync from 'superstore-sync';

import { AppInitializer } from '../js/app-initializer';

// returns {flags, allStylesLoaded, appInfo}
const app = new AppInitializer();

window.FT.nUi = Object.assign({}, app.env, {
	onAppInitialized: app.onAppInitialized,
	ads: ads,
	tracking: tracking,
	_hiddenComponents: {
		oDate,
		oViewport,
		nUiFoundations,
		oGrid,
		nImage,
		ftdomdelegate,
		superstore,
		superstoreSync
	}
});

// must be after the definition of window.ft.Nui as some subcomponents will
// depend on it
// TODO - see if webpack 3's dynamic imports can replace the above hack
app.bootstrap(window.FT.nUiConfig || {
	preset: 'discrete'
});
