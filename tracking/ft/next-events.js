const Timing = require('./events/navigation-timing');
const Cta = require('./events/cta');
const Copy = require('./events/copy');
const Attention = require('./events/page-attention');
const Positional = require('./events/positional');

const NextEvents = function () {};

NextEvents.prototype.init = function() {

	// Initialise any call-to-action tracking code
	this.cta = new Cta();
	this.cta.track(document.body);

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

NextEvents.prototype.destroy = function () {
	this.cta.destroy();
};

module.exports = new NextEvents();
