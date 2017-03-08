const colors = require('colors');
const util = require('util');

function log (args, color) {
	let msg = util.format.apply(null, args);
	if(color){
		msg = colors[color](msg);
	}
	console.log(msg);//eslint-disable-line
}

module.exports = {
	info: function () {
		log([].slice.apply(arguments), 'cyan');
	},
	warn: function () {
		log([].slice.apply(arguments), 'yellow');
	},
	error: function () {
		log([].slice.apply(arguments), 'red');
	},
	log: function () {
		log([].slice.apply(arguments));
	},
	success: function () {
		log([].slice.apply(arguments), 'green');
	}
};
