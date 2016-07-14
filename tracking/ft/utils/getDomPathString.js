const getDomPath = require('./getDomPath');

const getDomPathString = function (element) {
	return getDomPath(element, []).reverse().join(' | ');
};

module.exports = getDomPathString;
