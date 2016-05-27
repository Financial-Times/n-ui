// TODO: integrate next-js-setup into this repo
import layout from './layout';
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

let configuration = {};

export function configure (options = {}) {
	// NOTE: just store configuration for now, need to wait for polyfill to load before assigning
	configuration = options;
}

export function bootstrap (cb) {
	cb = cb || (() => null);

	return layout.bootstrap(({ flags, mainCss, appInfo }) => { // eslint-disable-line

		if (!configuration.preset) {
			throw new Error('n-ui configure options must include a preset');
		}

		const opts = Object.assign({}, presets[configuration.preset], configuration);

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
						anonymous: !(/FTSession=/.test(document.cookie)),
						flags
					});
				}
			});

		return Promise.resolve({flags, mainCss})
			.then(cb);
	})
};
