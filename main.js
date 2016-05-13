import oDate from './foundation/date';
// TODO: integrate n-layout into this repo
import layout from 'n-layout';
// TODO: integrate next-js-setup into this repo
import setup from 'next-js-setup';
// TODO: these should be configurable as they're not foundations
import prompts from './components/message-prompts';
import { client as myFtClient, ui as myFtUi } from './components/myft';

module.exports = {
	bootstrap: function (cb, opts = {}) {
		return setup.bootstrap(({ flags }) => {
			// NOTE: make sure we init myft client *before* n-layout
			const clientOpts = [];
			flags.get('follow') && clientOpts.push({relationship: 'followed', type: 'concept'});
			flags.get('saveForLater') && clientOpts.push({relationship: 'saved', type: 'content'});
			const myftClient = myFtClient.init(clientOpts);

			layout.init(flags, opts);
			oDate.init();
			prompts.init();
			myFtUi.init({ anonymous: !(/FTSession=/.test(document.cookie)) });
			return Promise.resolve({flags}).then(cb);
		})
	}
};
