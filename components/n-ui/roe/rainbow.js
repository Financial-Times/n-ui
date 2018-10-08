const rainbowize = () => {
	const pallete = [
		'#E70000',
		'#FF8C00',
		'#FFEF00',
		'#00811F',
		'#0044FF',
		'#760089'
	];

	[...document.querySelectorAll('.o-header__nav-item')].forEach((el, i) => el.setAttribute('style', `color: ${pallete[i % pallete.length]} !important`));
};

export default rainbowize;
