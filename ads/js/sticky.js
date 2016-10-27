const debounce = require('./utils').debounce;

function Sticky (el, sibling, boundary) {
	this.fixed = el;
	this.boundary = boundary;
	this.sibling = sibling;
	this.eventdbScrollEnd = debounce(this.scrollEnd.bind(this), 300);
	this.eventScrollStart = this.scrollStart.bind(this);
	this.cookieCloseButton = document.querySelector('.o-cookie-message__close-btn');
	this.extraHeight = 0;
	this.animationFrame;
	this.startScroll;
	this.boundaryBottom;
	this.fixedHeight;
	this.timeoutHandler;
	this.finished;
}



Sticky.prototype.startLoop = function () {
	this.animationFrame = window.requestAnimationFrame(() => {
		this.calculate();
		this.startLoop();
	});
}

Sticky.prototype.calculate = function () {
	const scrollY = window.pageYOffset || window.scrollY;
	const atBoundary = (scrollY - this.startScroll + this.fixedHeight) >= this.boundaryBottom;
	const isAbsolute = this.fixed.style.position === 'absolute';
	const canBeFixed = ((scrollY - this.extraHeight) >= 0);

	if ((atBoundary && !isAbsolute)) {
		this.unstick();
	}

	if (!atBoundary && isAbsolute && canBeFixed) {
		this.stick();
	}

	if ((!canBeFixed && !isAbsolute) || (!atBoundary && isAbsolute && !canBeFixed)) {
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
	this.fixed.style.top = `${this.startScroll + this.boundaryBottom - this.fixedHeight}px`;
}


Sticky.prototype.reset = function () {
	this.fixed.style.position = 'absolute';
	this.fixed.style.top = `${this.extraHeight}px`;
}

Sticky.prototype.destroy = function (unsetCallbackFunctions) {
	window.removeEventListener('scroll', this.eventdbScrollEnd);
	window.removeEventListener('scroll', this.eventScrollStart);
	window.removeEventListener('oAds.collapsed', this.collapsedCallback);
	this.cookieCloseButton.removeEventListener('click', this.cookieCloseEvent)
	this.endLoop();
	this.fixed.style.top = '';
	this.fixed.style.position = 'relative';
	this.sibling.style.marginTop = '';
	this.fixed.style.zIndex = '';
	this.windowWidth = false;
	if(unsetCallbackFunctions) {
		this.finished = true;
		this.eventScrollStart = undefined;
		this.eventdbScrollEnd = undefined;
	}
}
Sticky.prototype.endLoop = function () {
	window.cancelAnimationFrame(this.animationFrame);
}

Sticky.prototype.scrollStart = function () {
	window.removeEventListener('scroll', this.eventScrollStart);
	window.addEventListener('scroll', this.eventdbScrollEnd)

	// only do this work once
	this.fixedHeight = this.fixed.offsetHeight;
	this.startScroll = window.pageYOffset || window.scrollY;;
	this.boundaryBottom = this.boundary.getBoundingClientRect().bottom;

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

Sticky.prototype.setInitialValues = function () {
	const fixedElementTopPosition = this.fixed.getBoundingClientRect().top;
	this.fixed.style.zIndex = '23';
	this.fixed.style.top = `${fixedElementTopPosition}px`;
	this.sibling.style.marginTop = `${this.fixed.offsetHeight}px`;
	this.boundaryBottom = this.boundary.getBoundingClientRect().bottom;

	if (fixedElementTopPosition > 0) {
		this.extraHeight = fixedElementTopPosition;
		this.fixed.style.position = 'absolute';
	} else {
		this.fixed.style.position = 'fixed';
	}
}

Sticky.prototype.timeoutHandler = function () {
	clearTimeout(this.timeout);
	const scrollY = window.pageYOffset || window.scrollY;
	if(scrollY === 0 || this.boundary.getBoundingClientRect().top <= 0) {
			this.destroy(true);
	} else {
		setTimeout(this.timeoutHandler.bind(this), 1000);
	}
}

Sticky.prototype.init = function () {
	// do not init if user already started scrolling or on iOS/Android devices as the stickiness behaves flaky on iOS/Android. Issue: ADS-1112
	if (!this.fixed || !this.sibling || !this.boundary || window.pageYOffset > 0 || window.scrollY > 0 || window.navigator.userAgent.match(/i.*OS\s(\d+)_(\d+)/) || window.navigator.userAgent.match(/android/i)){
		return;
	};
	this.windowWidth = window.innerWidth;
	this.setInitialValues();

	if (this.cookieCloseButton) {
		this.cookieCloseEvent = this.cookieCloseButton.addEventListener('click', function () {
			if(!this.finished){
				this.extraHeight = 0;
				this.reset();
			}
			this.cookieCloseButton.removeEventListener('click', this.cookieCloseEvent)
		}.bind(this));
	}

	window.addEventListener('scroll', this.eventScrollStart);

	this.resizeCallback = debounce(function () {
		// makesure width actually changed. Resize gets fired on mobile for some reason
		if(window.innerWidth !== this.windowWidth) {
			this.destroy();
			debounce(this.init.bind(this), 300).call();
		}
	}.bind(this), 300);

	window.removeEventListener('resize', this.resizeCallback);
	window.addEventListener('resize', this.resizeCallback);

	this.collapsedCallback = debounce(function (eventDetail) {
		const container = eventDetail.detail;
		if(container && container.hasAttribute && container.hasAttribute('data-sticky-ad')) {
				this.destroy();
		}
	}.bind(this));

	window.addEventListener('oAds.collapsed', this.collapsedCallback);

	this.timeout = setTimeout(this.timeoutHandler.bind(this), 5000);
}

module.exports = Sticky;
