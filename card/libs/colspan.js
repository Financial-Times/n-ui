// turn { default: 12, XL: 2} into '12 XL2'
export default config =>
	['default', 'XS', 'S', 'M', 'L', 'XL']
		.reduce((colspan, breakpoint) => {
			if (config[breakpoint]) {
				const colspanPrefix = breakpoint !== 'default' ? breakpoint : '';
				colspan.push(colspanPrefix + config[breakpoint]);
			}
			return colspan;
		}, [])
		.join(' ');
