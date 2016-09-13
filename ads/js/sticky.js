const debounce = require('./utils').debounce;

function Sticky (el, opts) {
	this.el = el;
	this.opts = opts || {};
	this.sibling = (opts.sibling) ? document.querySelector(opts.sibling) : null;
	this.stickUntil = (opts.stickUntil) ? document.querySelector(opts.stickUntil) : null;
	this.opts.stickAfter = this.el.getBoundingClientRect().top;
}

Sticky.prototype.stick = function () {
	this.el.style.position = 'fixed';
	this.el.style.top = this.opts.topOffset || '0';
	if (this.sibling) {this.sibling.style.marginTop = this.el.offsetHeight + 'px';}
};

Sticky.prototype.onScroll = function () {
	if((this.stickyUntilPoint > window.pageYOffset) && (window.pageYOffset > this.opts.stickAfter)) {
		requestAnimationFrame(this.stick.bind(this));
	} else if (this.stickyUntilPoint < window.pageYOffset) {
		requestAnimationFrame(this.unstick.bind(this));
	}
	else if (window.pageYOffset < this.opts.stickAfter) {
		this.el.style.position = 'static';
	}
};

Sticky.prototype.bindScroll = function () {
	this.onScrollListener = debounce(this.onScroll).bind(this);
	window.addEventListener('scroll', this.onScrollListener);
};

Sticky.prototype.unstick = function () {

	this.el.style.position = 'absolute';
	this.el.style.top = (this.stickyUntilPoint - this.el.offsetHeight) + 'px';
	//this.sibling.style.marginTop = this.el.offsetHeight + 'px';
};

Sticky.prototype.init = function () {
	if(!this.el || window.pageYOffset > 0) {
		return;
	};
	this.stickyUntilPoint = (this.stickUntil.offsetTop + this.stickUntil.offsetHeight - this.el.offsetHeight);
	this.el.style.zIndex = '23';
	this.bindScroll();
};

module.exports = Sticky;
