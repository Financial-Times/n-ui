const oTracking = require('o-tracking');
const Timing = require('./events/navigation-timing');
const Copy = require('./events/copy');
const Attention = require('./events/page-attention');
const Positional = require('./events/positional');

const NextEvents = function () {};

NextEvents.prototype.init = function () {

	// Click-event tracking - https://github.com/Financial-Times/o-tracking
	oTracking.link.init();

	// text copy -> clipboard tracking
	this.copy = new Copy(document.body);
	this.copy.track();
	this.attention = new Attention();
	this.attention.init();

	this.positional = new Positional();
	this.positional.init(document);

	// Nav timing - https://developer.mozilla.org/en-US/docs/Navigation_timing
	new Timing().track();
};

module.exports = new NextEvents();
