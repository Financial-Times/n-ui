import {loadScript} from '../../../utils';

const getCookieValue = function (key) {
	const regex = new RegExp(`${key}=([^;]+)`, 'i');
	const a = regex.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

// Loads session cam tracking code
module.exports = function (flags) {

	if (flags && (flags.get('mouseflowForce') || flags.get('mouseflow'))) {

		const _mfq = _mfq || [];
		_mfq.push(['setVariable', 'spoorId', getCookieValue('spoor-id')]);
		loadScript('https://cdn.mouseflow.com/projects/3d6fc486-2914-4efc-a5ae-35a5eac972f2.js');

	}
}
