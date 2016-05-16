// TODO: integrate next-js-setup into this repo
import setup from 'next-js-setup';
import date from './foundation/date';
import header from './components/header';
import cookieMessage from './components/cookie-message';
import welcomeMessage from './components/welcome-message';
import messagePrompts from './components/message-prompts';
import { client as myFtClient, ui as myFtUi } from './components/myft';

const presets = {
	discrete: {
		header: true,
		date: true
	},
	all: {
		header: true,
		date: true,
		cookieMessage: true,
		welcomeMessage: true,
		myft: true,
		messagePrompts: true
	}
}

module.exports = {
	bootstrap: function (opts = {}, cb) {
		cb = cb || (() => null);

		if (opts.preset) {
			opts = Object.assign({}, presets[opts.preset], opts);
		}

		return setup.bootstrap(({ flags }) => {

			if (opts.myft) {

				const clientOpts = [];

				if (flags.get('follow')) {
					clientOpts.push({relationship: 'followed', type: 'concept'});
				}

				if (flags.get('saveForLater')) {
					clientOpts.push({relationship: 'saved', type: 'content'});
				}

				myFtClient.init(clientOpts);
			}

			if (opts.header) {
				header.init(flags);
			}

			if (opts.cookieMessage) {
				cookieMessage.init();
			}

			// require('n-interactive-tour').init(flags);

			if (opts.welcomeMessage) {
				flags.get('welcomePanel') && welcomeMessage.init({
					enableOverlay: flags.get('myFTOnboardingOverlay')
				});
			}

			if (opts.date) {
				date.init();
			}

			if (opts.messagePrompts) {
				messagePrompts.init();
			}

			if (opts.myft) {
				myFtUi.init({ anonymous: !(/FTSession=/.test(document.cookie)) });
			}
			return Promise.resolve({flags})
				.then(cb);
		})
	}
};
