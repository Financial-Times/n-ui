import {loadScript} from '../../../utils';

const getAllocationId = function () {
	const a = /FTAllocation=([^;]+)/i.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

// Loads session cam tracking code
module.exports = function (flags) {

	const isSignUpApp = !!document.querySelector('html[data-next-app=signup]');

	if (flags && (flags.get('mouseflowForce') || flags.get('mouseflow'))) {

		var _mfq = _mfq || [];

		(function() {
			var mf = document.createElement("script");
			mf.type = "text/javascript"; mf.async = true;
			mf.src = "//cdn.mouseflow.com/projects/3d6fc486-2914-4efc-a5ae-35a5eac972f2.js";
			document.getElementsByTagName("head")[0].appendChild(mf);
		})();

		_mfq.push(['setVariable', 'allocationId', getAllocationId()]);

	}
}
