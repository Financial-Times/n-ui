const debounce = require('./utils').debounce;
const stickyNavHeight = 74;

function Sticky (el, opts) {
	if (!el) return;
	this.el = el;
	this.opts = opts || {};
	this.sibling = opts.sibling ? document.querySelector(opts.sibling) : null;
	this.stickUntil = document.querySelector(opts.stickUntil);
	this.extraHeight = false;
	this.stickWhen = this.el.getBoundingClientRect().top - stickyNavHeight;
}

Sticky.prototype.stick = function () {
	this.el.style.position = 'fixed';
	this.el.style.top = this.opts.paddingTop + 'px' || '0';
	if (this.sibling) { this.sibling.style.marginTop = this.el.offsetHeight + 'px'; }
};

Sticky.prototype.unstick = function () {
	this.el.style.position = 'absolute';
	if (this.sibling) {
		this.el.style.top = this.releasePoint + 'px';
		this.sibling.style.marginTop = this.el.offsetHeight + 'px';
	} else {
		this.el.style.top = (this.releasePoint - this.el.offsetHeight) + 'px';
	}
};

Sticky.prototype.onScroll = function () {
	if (!this.extraHeight && document.querySelector('.visible .n-header__marketing-promo__container')) {
		this.releasePoint += 50;
		this.extraHeight = true
	}

	let breakPoint;
	let viewportOffset = window.pageYOffset || window.scrollY
	this.sibling ? breakPoint = this.releasePoint : breakPoint = this.releasePoint + stickyNavHeight + this.opts.paddingTop;

	if((breakPoint > viewportOffset) && (viewportOffset >= this.stickWhen)) {
		requestAnimationFrame(this.stick.bind(this));
	} else if (breakPoint < viewportOffset) {
		requestAnimationFrame(this.unstick.bind(this));
	}
	else if (viewportOffset <= this.stickWhen) {
		this.reset();
	}
};

Sticky.prototype.startLoop = function () {
	this.lastAnimationFrame = window.requestAnimationFrame(() => {
		this.onScroll();
		this.startLoop();
	})
};

Sticky.prototype.stopLoop = function () {
	this.lastAnimationFrame && window.cancelAnimationFrame(this.lastAnimationFrame);
};

Sticky.prototype.bindScroll = function () {
	window.removeEventListener('scroll', this.bindScroll);
	window.addEventListener('scroll', this.debouncedScroll)
	this.startLoop()
};

Sticky.prototype.unbindScroll = function () {
	this.stopLoop()
	window.removeEventListener('scroll', this.debouncedScroll)
	window.addEventListener('scroll', this.bindScroll)
};

Sticky.prototype.onResize = function () {
	if(this.onScrollListener && this.el.offsetHeight < 10) {
		this.unbindScroll();
	} else if (!this.onScrollListener && this.el.offsetHeight >= 10) {
		this.bindScroll();
	}
	this.releasePoint = (this.stickUntil.offsetTop + this.stickUntil.offsetHeight - this.el.offsetHeight);
};

Sticky.prototype.reset = function () {
	this.el.style.position = 'static';
	this.sibling ? this.sibling.style.marginTop = '0px' : this.sibling;
};

Sticky.prototype.init = function () {
	if(!this.el || window.pageYOffset > 0 || window.scrollY > 0) {
		return;
	};
	this.releasePoint = (this.stickUntil.offsetTop + this.stickUntil.offsetHeight - this.el.offsetHeight);
	this.el.style.zIndex = '23';

	window.addEventListener('resize', debounce(this.onResize).bind(this));
	window.addEventListener('scroll', this.bindScroll());
};

module.exports = Sticky;
