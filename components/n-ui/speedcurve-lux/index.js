// tell LUX what flag variants this user has
function addAbStateDataToLux () {
	const dataAbState = document.documentElement.getAttribute('data-ab-state');
	if (dataAbState && dataAbState !== '-') {
		dataAbState.split(/\s*,\s*/)
			.map(test => test.split(/\s*:\s*/))
			.map(([flagName, variant]) => ({ flagName, variant }))
			// only include sw flags if sw is supported
			.filter(({flagName}) => !/^sw[A-Z]/.test(flagName) || navigator.serviceWorker)
			.forEach(({ flagName, variant }) => window.LUX.addData(flagName, variant));
	}
}

export function addFlags () {
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
