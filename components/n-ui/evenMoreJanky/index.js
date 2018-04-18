// For a list of elements,
// Immediately make them arbitrarily taller than their intended height.
// Then over time, allow them to resume their intended hight, thus creating a "janky" effect;
// That is, the content "stutters" up/down the web page as the page layout updates.

function init (flags) {
	if (!flags || !flags.get('evenMoreJanky')) {
		return;
	}

	const styleNode = document.createElement('style');
	styleNode.type = 'text/css';
	const styleText = document.createTextNode(`
		.janky {
				padding-top: 20px;
				padding-bottom: 20px;
		}
	`);
	styleNode.appendChild(styleText);
	document.getElementsByTagName('head')[0].appendChild(styleNode);

	[
		'#o-cookie-message',
		'#top-gpt',
		'.js-markets-data',
		'#site-navigation',
		'#o-header-nav-desktop',
		'#site-content',
		'.js-track-scroll-event',
		'.o-grid-container',
		'.article__content',
		'.article-info',
	]
	.forEach(selector => {
		document.querySelectorAll(selector).forEach(element => {
			element.className += ' janky';
			setTimeout(() => {
				element.className = element.className.replace(new RegExp(/ janky/, 'g'), '');
			},
				Math.floor(Math.random() * 4000) + 1000);
		});
	});
}

module.exports = { init };
