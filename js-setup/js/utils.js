module.exports = {
	loadScript: (src) => {
		return new Promise((res, rej) => {
			const script = window.ftNextLoadScript(src);
			script.addEventListener('load', res);
			script.addEventListener('error', rej);
		});
	},
	waitForCondition: (conditionName, action) => {
		window[`ftNext${conditionName}Loaded`] ? action() : document.addEventListener(`ftNext${conditionName}Loaded`, action)
	}
}
