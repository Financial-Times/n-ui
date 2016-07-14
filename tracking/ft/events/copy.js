const broadcast = require('../../../utils').broadcast;

const Copy = function (root) {
	this.root = root || document;
};

Copy.prototype.track = function () {

	this.root.addEventListener('copy', function (e) {

		const element = e.target;
		const data = {
			action: 'copy',
			category: 'text',
			context: {
				nodeName: element.nodeName.toLowerCase(),
				product: 'next'
			}
		};

		if (window.getSelection) {
			const selection = window.getSelection().toString();
			data.context.characters = selection.length;
			data.context.words = Math.ceil(selection.split(/\b/).length / 2);
			if (selection.length > 100) {
				data.selection = selection.substr(0, 47) + ' ... ' + selection.substr(-47);
			} else {
				data.selection = selection;
			}
		}
		broadcast('oTracking.event', data);
	});
};

module.exports = Copy;
