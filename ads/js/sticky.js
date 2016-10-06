const debounce = require('./utils').debounce;

function Sticky (el, sibling, boundary) {
	this.fixed = el;
	this.boundary = boundary;
	this.sibling = sibling;
	this.eventdbScrollEnd = debounce(this.scrollEnd.bind(this), 300);
	this.eventScrollStart = this.scrollStart.bind(this);
	this.extraHeight = 0;

	this.animationFrame;
	this.startScroll;
	this.boundaryTop;
	this.fixedHeight;
}



Sticky.prototype.startLoop = function () {
	this.animationFrame = window.requestAnimationFrame(() => {
		this.calculate();
		this.startLoop();
	});
}

Sticky.prototype.calculate = function () {
	const scrollY = window.pageYOffset || window.scrollY;
	const atBoundary = (scrollY - this.startScroll + this.fixedHeight) >= this.boundaryTop;
	const isAbsolute = this.fixed.style.position === 'absolute';
	const extraAbsolute = ((scrollY - this.extraHeight) >= 0);

	if ((atBoundary && !isAbsolute)) {
		this.unstick();
	}

	if (!atBoundary && isAbsolute && extraAbsolute) {
		this.stick();
	}

	if ((!extraAbsolute && !isAbsolute) || (!atBoundary && isAbsolute && !extraAbsolute)) {
		this.reset();
	}
}

Sticky.prototype.stick = function () {
	this.fixed.style.position = 'fixed';
	this.fixed.style.top = '0px';
	this.sibling.style.marginTop = `${this.fixedHeight}px`;
}

Sticky.prototype.unstick = function () {
	this.fixed.style.position = 'absolute';
	this.fixed.style.top = `${this.startScroll + this.boundaryTop - this.fixedHeight}px`;
}


Sticky.prototype.reset = function () {
	this.fixed.style.position = 'absolute';
	this.fixed.style.top = `${this.extraHeight}px`;
}

Sticky.prototype.endLoop = function () {
	window.cancelAnimationFrame(this.animationFrame);
}

Sticky.prototype.scrollStart = function () {
	window.removeEventListener('scroll', this.eventScrollStart);
	window.addEventListener('scroll', this.eventdbScrollEnd)

	// only do this work once
	this.fixedHeight = this.fixed.offsetHeight;
	this.startScroll = window.pageYOffset;
	this.boundaryTop = this.boundary.getBoundingClientRect().top;

	if (this.sibling.style.marginTop !== `${this.fixedHeight}px`) {
		this.sibling.style.marginTop = `${this.fixedHeight}px`;
	}

	this.startLoop();
}

Sticky.prototype.scrollEnd = function () {
	this.endLoop();
	window.removeEventListener('scroll', this.eventdbScrollEnd);
	window.addEventListener('scroll', this.eventScrollStart);
}

Sticky.prototype.init = function () {
	if (!this.fixed || !this.sibling || !this.boundary || window.pageYOffset > 0 || window.scrollY > 0) {
		return;
	};

	const fixedElementTopPosition = this.fixed.getBoundingClientRect().top;
	this.fixed.style.zIndex = '23';
	this.fixed.style.top = `${fixedElementTopPosition}px`;
	this.sibling.style.marginTop = `${this.fixed.offsetHeight}px`;

	if (fixedElementTopPosition > 0) {
		this.extraHeight = fixedElementTopPosition;
		this.fixed.style.position = 'absolute';
	} else {
		this.fixed.style.position = 'fixed';
	}


	window.addEventListener('scroll', this.eventScrollStart);

	const cookieCloseButton = document.querySelector('.o-cookie-message__close-btn');
	if (cookieCloseButton) {
		const cookieCloseEvent = cookieCloseButton.addEventListener('click', function () {
			this.extraHeight = 0;
			this.boundaryTop = this.boundary.getBoundingClientRect().top;
			this.reset();
			cookieCloseButton.removeEventListener('click', cookieCloseEvent)
		}.bind(this));
	}
}

module.exports = Sticky;
