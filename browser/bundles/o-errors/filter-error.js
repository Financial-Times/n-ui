module.exports = (reportedObject) => {
	// we want to filter out errors that only occur
	// when critical scripts fail to load - in that case
	// the execution of JS is halted and we fall back to core
	const errorFilter = /\bwindow\.FT\.(flags|nUi|ftNextUi) is undefined/i;
	let windowFtError;
	if ('error' in reportedObject) {
			try {
				windowFtError = !!String(reportedObject.error).match(errorFilter);
			} catch (err) {
				// could not stringify the error
			}
	}
	// filter if yes, or if o-errors disabled
	return !(windowFtError || window.FT.disableOErrors);
};
