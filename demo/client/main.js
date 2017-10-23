import {flags, onAppInitialized, tracking} from 'n-ui';

console.log(flags); //eslint-disable-line

tracking.scrollDepth.init('n-ui test');


onAppInitialized();
