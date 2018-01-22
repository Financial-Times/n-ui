function addFlags () {
	// is LUX ready?
	if (!window.LUX || !window.LUX.addData) {
		// wait for when it is ready
		const script = document.querySelector('[data-next-speedcurve-lux-script]');
		script.addEventListener('load', () => addFlags(flags));
	} else {
		// LUX is indeed ready...

		// tell LUX what flag variants this user has
		const dataAbState = document.documentElement.getAttribute('data-ab-state');
		if (dataAbState && dataAbState !== '-') {
			dataAbState.split(/\s*,\s*/)
				.map(test => test.split(/\s*:\s*/))
				.map(test => ({ flagName: test[0], variant: test[1] }))
				.forEach(test => window.LUX.addData(test.flagName, test.variant));
		}
	}
}

module.exports = { addFlags };
