module.exports = (reportedObject) => {
	// FIXME: explain why it's okay to fitler these errors out
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
