// TODO: integrate next-js-setup into this repo
import setup from 'next-js-setup';
import date from './date';
import header from './header';
import cookieMessage from './cookie-message';
import welcomeMessage from './welcome-message';
import messagePrompts from './message-prompts';
import { client as myFtClient, ui as myFtUi } from './myft';

const presets = {
	discrete: {
		header: true,
		date: true
	},
	complete: {
		header: true,
		date: true,
		cookieMessage: true,
		welcomeMessage: true,
		myft: true,
		messagePrompts: true
	}
};

const opts = {};

export function configure (options = {}) {
	if (options.preset) {
		Object.assign(opts, presets[options.preset], options);
	} else {
		throw new Error('n-ui configure options must include a preset');
	}
}

export function bootstrap (cb) {
	cb = cb || (() => null);

	return setup.bootstrap(({ flags, mainCss }) => {

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

		if (opts.date) {
			date.init();
		}

		mainCss
			.then(() => {
				if (opts.cookieMessage) {
					cookieMessage.init();
				}

				if (opts.welcomeMessage) {
					flags.get('welcomePanel') && welcomeMessage.init({
						enableOverlay: flags.get('myFTOnboardingOverlay')
					});
				}

				if (opts.messagePrompts) {
					messagePrompts.init();
				}

				if (opts.myft) {
					myFtUi.init({
						anonymous: !(/FTSession=/.test(document.cookie))
					});
				}
			});

		return Promise.resolve({flags, mainCss})
			.then(cb);
	})
};
