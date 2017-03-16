import {bootstrap} from '../../main';
const tracking = require('../../components/n-ui/tracking');

bootstrap({preset: 'complete', compactViewPromo: true}, () => {
	tracking.scrollDepth.init('n-ui-test');
});
