const obfuscatedFilter = '\x69\x6e\x76\x65\x72\x74';

const bodyInversion = ({ flag }) => {
	const body = document.body.style;
	const lastStyleSheet = document.styleSheets[document.styleSheets.length - 1];

	if (!body || !lastStyleSheet) { return; }

	body.backgroundColor = 'inherit';

	lastStyleSheet.insertRule(`body, img, iframe {
		filter: ${obfuscatedFilter}(${flag ? '100%' : 0});
		transition: 'filter 300ms ease-in-out';
	}`, lastStyleSheet.cssRules.length);
};

export default bodyInversion;
