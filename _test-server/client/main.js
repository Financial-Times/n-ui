import {bootstrap} from '../../main';
const tracking = require('../../tracking');

bootstrap({preset: 'complete'}, () => {
	tracking.scrollDepth.init('n-ui-test');
});
