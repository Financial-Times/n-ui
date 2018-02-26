module.exports = ({ error }) => {
	// we want to filter out errors that only occur
	// when critical scripts fail to load - in that case
	// the execution of JS is halted and we fall back to core
	const errorFilters = [ 
		/window\.FT\.(flags|nUi|ftNextUi)/i,
		/undefined is|is undefined/i
	];
	let windowFtError;
	if(error) {
		try {
			let errorString = String(error);
			windowFtError = errorFilters.every(rx => rx.test(errorString));
		} catch (err) {
			// could not stringify the error
		}
	}

	// filter if yes, or if o-errors disabled
	return !(windowFtError || window.FT.disableOErrors);
};
