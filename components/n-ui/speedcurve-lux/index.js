// tell LUX what flag variants this user has
function addAbStateDataToLux () {
	const dataAbState = document.documentElement.getAttribute('data-ab-state');
	if (dataAbState && dataAbState !== '-') {
		dataAbState.split(/\s*,\s*/)
			.map(test => test.split(/\s*:\s*/))
			.map(test => ({ flagName: test[0], variant: test[1] }))
			.forEach(test => window.LUX.addData(test.flagName, test.variant));
	}
}

function addFlags () {
	// is LUX ready?
	if (!window.LUX || !window.LUX.addData) {
		// wait for when it is ready
		const script = document.querySelector('[data-next-speedcurve-lux-script]');
		script.addEventListener('load', () => addFlags());
	} else {
		// LUX is indeed ready
		addAbStateDataToLux();
	}
}

module.exports = { addFlags };
