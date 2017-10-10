// we can use n-ui as a dependency even within n-ui as this is built using the
// externals definition which maps n-ui to window.FT.nUi
import {flags, onAppInitialized} from 'n-ui';

console.log(flags); //eslint-disable-line

onAppInitialized();
