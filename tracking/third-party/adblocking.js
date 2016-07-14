/*
* Modified version of below by simon.legg@ft.com
*
* BlockAdBlock 3.2.1
* Copyright (c) 2015 Valentin Allaire <valentin.allaire@sitexw.fr>
* Released under the MIT license
* https://github.com/sitexw/BlockAdBlock
*/


import {broadcast} from '../../utils';

const BlockAdBlock = function () {
	this._options = {
		checkOnLoad: true,
		resetOnEnd: true,
		loopCheckTime: 50,
		loopMaxNumber: 5,
		baitClass: 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links',
		baitStyle: 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;'
	};
	this._var = {
		version: '3.2.1',
		bait: null,
		checking: false,
		loop: null,
		loopNumber: 0,
		event: {
			detected: [],
			notDetected: []
		}
	};

	const eventCallback = () => {
		setTimeout(() => {
			if (this._options.checkOnLoad === true) {
				if (this._var.bait === null) {
					this._creatBait();
				}
				setTimeout(() => {
					this.check();
				}, 1);
			}
		}, 1);
	};
	if (window.addEventListener !== undefined) {
		window.addEventListener('load', eventCallback, false);
	} else {
		window.attachEvent('onload', eventCallback);
	}
};

BlockAdBlock.prototype._creatBait = function () {
	const bait = document.createElement('div');
	bait.setAttribute('class', this._options.baitClass);
	bait.setAttribute('style', this._options.baitStyle);
	this._var.bait = window.document.body.appendChild(bait);

	this._var.bait.offsetParent;
	this._var.bait.offsetHeight;
	this._var.bait.offsetLeft;
	this._var.bait.offsetTop;
	this._var.bait.offsetWidth;
	this._var.bait.clientHeight;
	this._var.bait.clientWidth;
};

BlockAdBlock.prototype._destroyBait = function () {
	window.document.body.removeChild(this._var.bait);
	this._var.bait = null;
};

BlockAdBlock.prototype.check = function (loop) {
	if (loop === undefined) {
		loop = true;
	}

	if (this._var.checking === true) {
		return false;
	}
	this._var.checking = true;

	if (this._var.bait === null) {
		this._creatBait();
	}

	this._var.loopNumber = 0;
	if (loop === true) {
		this._var.loop = setInterval(() => {
			this._checkBait(loop);
		}, this._options.loopCheckTime);
	}
	setTimeout(() => {
		this._checkBait(loop);
	}, 1);

	return true;
};

BlockAdBlock.prototype._checkBait = function (loop) {
	let detected = false;

	if (this._var.bait === null) {
		this._creatBait();
	}

	if (window.document.body.getAttribute('abp') !== null || this._var.bait.offsetParent === null || this._var.bait.offsetHeight === 0 || this._var.bait.offsetLeft === 0 || this._var.bait.offsetTop === 0 || this._var.bait.offsetWidth === 0 || this._var.bait.clientHeight === 0 || this._var.bait.clientWidth === 0) {
		detected = true;
	}
	if (window.getComputedStyle !== undefined) {
		const baitTemp = window.getComputedStyle(this._var.bait, null);
		if (baitTemp && (baitTemp.getPropertyValue('display') === 'none' || baitTemp.getPropertyValue('visibility') === 'hidden')) {
			detected = true;
		}
	}

	if (loop === true) {
		this._var.loopNumber++;
		if (this._var.loopNumber >= this._options.loopMaxNumber) {
			this._stopLoop();
		}
	}

	if (detected === true) {
		this._stopLoop();
		this._destroyBait();
		this.emitEvent(true);
		if (loop === true) {
			this._var.checking = false;
		}
	} else if (this._var.loop === null || loop === false) {
		this._destroyBait();
		this.emitEvent(false);
		if (loop === true) {
			this._var.checking = false;
		}
	}
};

BlockAdBlock.prototype._stopLoop = function () {
	clearInterval(this._var.loop);
	this._var.loop = null;
	this._var.loopNumber = 0;
};

BlockAdBlock.prototype.emitEvent = function (detected) {
	const fns = this._var.event[(detected === true ? 'detected' : 'notDetected')];
	for (let i in fns) {
		if (fns.hasOwnProperty(i)) {
			fns[i]();
		}
	}
	if (this._options.resetOnEnd === true) {
		this.clearEvent();
	}
	return this;
};

BlockAdBlock.prototype.clearEvent = function () {
	this._var.event.detected = [];
	this._var.event.notDetected = [];
};

BlockAdBlock.prototype.on = function (detected, fn) {
	this._var.event[(detected === true ? 'detected' : 'notDetected')].push(fn);
	return this;
};

BlockAdBlock.prototype.onDetected = function (fn) {
	return this.on(true, fn);
};

BlockAdBlock.prototype.onNotDetected = function (fn) {
	return this.on(false, fn);
};

function fireOTrackingEvent () {
	broadcast('oTracking.event', {
		category: 'ads',
		action: 'blocked',
		context: {
			provider: 'blockAdBlock'
		}
	});
};

module.exports = function (flags) {

	const isAllocated = function () {
		return /spoor-id=0/.test(document.cookie);
	}

	if (flags && flags.get('blockAdBlock') && isAllocated()) {
		const blockAdBlock = new BlockAdBlock();
		blockAdBlock.onDetected(fireOTrackingEvent);
	}

}
