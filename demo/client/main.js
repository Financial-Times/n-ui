// we can use n-ui as a dependency even within n-ui as this is built using the
// externals definition which maps n-ui to window.ftNextUi.
import {bootstrap} from 'n-ui';

bootstrap({ preset: 'complete' }, () => {});
