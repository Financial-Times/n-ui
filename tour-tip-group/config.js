module.exports = {
	intro: {
		id: 'intro',
		settings: {
			size: 'l'
		},
		content: {
			title: 'Welcome to the new FT',
			body: 'Take a moment to see what’s changed by scrolling through our new features below.',
			imageAlt: 'A laptop with the new FT.com loaded',
			imageUrl: 'https://www.ft.com/__assets/creatives/tour/pack-shot-2.png',
			imageWidths: [300,469,719,930],
			imageSizes: {
					M: '930px'
			},
			ctas: [{
				url: 'https://www.youtube.com/watch?v=xJL9gEePHcs',
				label: 'Watch the video'
			}]
		},
		modifiers: ['intro']
	},
	outro: {
		id: 'outro',
		settings: {
			size: 'l'
		},
		content: {
			title: 'Over to you',
			body: 'Now you’ve seen what you can do, make the most of the new FT.com.',
			ctas: [{
				url: '/',
				label: 'Get started'
			}]
		},
		modifiers: ['outro']
	}
};
