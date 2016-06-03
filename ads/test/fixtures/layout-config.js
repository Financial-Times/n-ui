'use strict'; //eslint-disable-line

module.exports = {
	'test-page' : {
		default: {
			'pageType': 'ind',
			'slots':	 [
				{
					'insert': 'beforeEnd',
					'selector': '.ad-test-1',
					'class': 'unit-test-advert-1',
					'attrs': {
						'name': 'test-ad-1',
						'targeting': 'pos=banlb;',
						'formats-small': false,
						'formats-medium': 'Leaderboard',
						'formats-large': 'Leaderboard,SuperLeaderboard',
						'out-of-page': false
					}
				},
				{
					'selector': '.ad-test-2',
					'class': 'unit-test-advert-2',
					'attrs': {
						'name': 'test-ad-2',
						'targeting': 'pos=banlb;',
						'formats-small': 'Leaderboard,SuperLeaderboard',
						'formats-medium': 'Leaderboard,SuperLeaderboard',
						'formats-large': 'Leaderboard,SuperLeaderboard',
						'out-of-page': false
					}
				}
			]
		},
		custom: {
			'pageType': 'ind',
			'slots':	 [
				{
					'insert': 'beforeEnd',
					'selector': '.ad-test-3',
					'class': 'unit-test-advert-3',
					'attrs': {
						'name': 'test-ad-3',
						'targeting': 'pos=banlb;',
						'formats-small': false,
						'formats-medium': false,
						'formats-large': 'Leaderboard,SuperLeaderboard',
						'out-of-page': false
					}
				}
			]
		},
	}
};
