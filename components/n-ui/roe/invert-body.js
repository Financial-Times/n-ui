const invertBody = ({ flag }) => {
	const body = document && document.body.style;

	if (!body) { return; }

	body.backgroundColor = 'inherit';
	body.transition = 'filter 300ms ease-in-out';
	body.filter = flag ? 'invert(100%)' : 'invert(0)';
};

export default invertBody;
