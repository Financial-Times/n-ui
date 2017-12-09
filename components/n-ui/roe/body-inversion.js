const obfuscatedFilter = '\x69\x6e\x76\x65\x72\x74';

const bodyInversion = ({ flag }) => {
	const body = document.body.style;

	if (!body) { return; }

	body.backgroundColor = 'inherit';
	body.transition = 'filter 300ms ease-in-out';
	body.filter = flag ? 'invert(100%)' : 'invert(0)';
};

export default bodyInversion;
