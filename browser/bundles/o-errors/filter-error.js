const errorFilter = /^(?=.*\bundefined\b)(?=.*(\bwindow.FT.flags\b|\bwindow.FT.nUi\b|\bwindow.FT.ftNextUi\b)).*$/gi;

module.exports = (reportedObject) => {
	// does the error contain an "undefined" followed by one of the below?
	// "window.FT.flags", "window.FT.nUi" or "window.FT.ftNextUi"
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
