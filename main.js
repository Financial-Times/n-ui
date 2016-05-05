import oDate from './date';

import layout from 'n-layout';
import setup from 'next-js-setup';
import prompts from './message-prompts';
import { client as myFtClient, ui as myFtUi } from './myft';

module.exports = {
	bootstrap: function (cb) {
		return setup.bootstrap(({ flags }) => {
			// NOTE: make sure we init myft client *before* n-layout
			const clientOpts = [];
			flags.get('follow') && clientOpts.push({relationship: 'followed', type: 'concept'});
			flags.get('saveForLater') && clientOpts.push({relationship: 'saved', type: 'content'});
			const myftClient = myFtClient.init(clientOpts);

			layout.init(flags);
			oDate.init();
			prompts.init();
			return Promise.resolve({flags}).then(cb);
		})
	}
};
