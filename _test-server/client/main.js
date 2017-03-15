import {bootstrap} from '../../main';
const tracking = require('../../tracking');

bootstrap({preset: 'complete', compactViewPromo: true}, () => {
	tracking.scrollDepth.init('n-ui-test');
});
