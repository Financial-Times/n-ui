module.exports = ({ exception }) => {
	// we want to filter out errors that only occur
	// when critical scripts fail to load - in that case
	// the execution of JS is halted and we fall back to core
	const errorFilters = [
		/window\.FT\.(flags|nUi|ftNextUi)/i,
		/'undefined' is|undefined is|is undefined/i,
		/service worker became redundant/i,
		/sourcepoint/i
	];
	let windowFtError;
	if(exception) {
		try {
			let errorString = JSON.stringify(exception);
			windowFtError = errorFilters.some(rx => rx.test(errorString));
		} catch (err) {
			// could not stringify the exception
		}
	}
	// filter if window.FT error or if o-errors disabled
	return !(windowFtError || window.FT.disableOErrors);
};
