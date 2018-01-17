function addFlags (flags) {
	// is LUX ready?
	if (!window.LUX || !window.LUX.addData) {
		// wait for when it is ready
		const script = document.querySelector('[data-next-speedcurve-lux-script]');
		script.addEventListener('load', () => addFlags(flags));
	} else {
		// LUX is indeed ready...

		// we're going to test this idea with just one flag
		// if it goes well, we may consider adding all flags :) :)
		const flagName = 'swAdsCaching';
		window.LUX.addData(flagName, flags.get(flagName));
	}
}

module.exports = { addFlags };
