module.exports = src => {
	const d = document;
	const o = d.createElement('script');
	o.src = src;
	const s = d.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(o, s.nextSibling);
	return o;
};
