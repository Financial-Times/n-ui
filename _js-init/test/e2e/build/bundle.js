/* eslint-disable */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

;(function () {
	'use strict'

	/**
  * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
  *
  * @codingstandard ftlabs-jsv2
  * @copyright The Financial Times Limited [All Rights Reserved]
  * @license MIT License (see LICENSE.txt)
  */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/

	/**
  * Instantiate fast-clicking listeners on the specified layer.
  *
  * @constructor
  * @param {Element} layer The layer to listen on
  * @param {Object} [options={}] The options to override the defaults
  */
	;
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
   * Whether a click is currently being tracked.
   *
   * @type boolean
   */
		this.trackingClick = false;

		/**
   * Timestamp for when click tracking started.
   *
   * @type number
   */
		this.trackingClickStart = 0;

		/**
   * The element being tracked for a click.
   *
   * @type EventTarget
   */
		this.targetElement = null;

		/**
   * X-coordinate of touch start event.
   *
   * @type number
   */
		this.touchStartX = 0;

		/**
   * Y-coordinate of touch start event.
   *
   * @type number
   */
		this.touchStartY = 0;

		/**
   * ID of the last touch, retrieved from Touch.identifier.
   *
   * @type number
   */
		this.lastTouchIdentifier = 0;

		/**
   * Touchmove boundary, beyond which a click will be cancelled.
   *
   * @type number
   */
		this.touchBoundary = options.touchBoundary || 10;

		/**
   * The FastClick layer.
   *
   * @type Element
   */
		this.layer = layer;

		/**
   * The minimum time between tap(touchstart and touchend) events
   *
   * @type number
   */
		this.tapDelay = options.tapDelay || 200;

		/**
   * The maximum time for a tap
   *
   * @type number
   */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function () {
				return method.apply(context, arguments);
			};
		}

		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function (type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function (type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function (event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
 * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
 *
 * @type boolean
 */
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
  * Android requires exceptions.
  *
  * @type boolean
  */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

	/**
  * iOS requires exceptions.
  *
  * @type boolean
  */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

	/**
  * iOS 4 requires an exception for select elements.
  *
  * @type boolean
  */
	var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

	/**
  * iOS 6.0-7.* requires the target element to be manually derived
  *
  * @type boolean
  */
	var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);

	/**
  * BlackBerry requires exceptions.
  *
  * @type boolean
  */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
  * Determine whether a given element requires a native click.
  *
  * @param {EventTarget|Element} target Target DOM element
  * @returns {boolean} Returns true if the element needs a native click
  */
	FastClick.prototype.needsClick = function (target) {
		switch (target.nodeName.toLowerCase()) {

			// Don't send a synthetic click to disabled inputs (issue #62)
			case 'button':
			case 'select':
			case 'textarea':
				if (target.disabled) {
					return true;
				}

				break;
			case 'input':

				// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
				if (deviceIsIOS && target.type === 'file' || target.disabled) {
					return true;
				}

				break;
			case 'label':
			case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
			case 'video':
				return true;
		}

		return (/\bneedsclick\b/.test(target.className)
		);
	};

	/**
  * Determine whether a given element requires a call to focus to simulate click into element.
  *
  * @param {EventTarget|Element} target Target DOM element
  * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
  */
	FastClick.prototype.needsFocus = function (target) {
		switch (target.nodeName.toLowerCase()) {
			case 'textarea':
				return true;
			case 'select':
				return !deviceIsAndroid;
			case 'input':
				switch (target.type) {
					case 'button':
					case 'checkbox':
					case 'file':
					case 'image':
					case 'radio':
					case 'submit':
						return false;
				}

				// No point in attempting to focus disabled inputs
				return !target.disabled && !target.readOnly;
			default:
				return (/\bneedsfocus\b/.test(target.className)
				);
		}
	};

	/**
  * Send a click event to the specified element.
  *
  * @param {EventTarget|Element} targetElement
  * @param {Event} event
  */
	FastClick.prototype.sendClick = function (targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function (targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};

	/**
  * @param {EventTarget|Element} targetElement
  */
	FastClick.prototype.focus = function (targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};

	/**
  * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
  *
  * @param {EventTarget|Element} targetElement
  */
	FastClick.prototype.updateScrollParent = function (targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};

	/**
  * @param {EventTarget} targetElement
  * @returns {Element|EventTarget}
  */
	FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};

	/**
  * On touch start, record the position and scroll offset.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchStart = function (event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if (event.timeStamp - this.lastClickTime < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};

	/**
  * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.touchHasMoved = function (event) {
		var touch = event.changedTouches[0],
		    boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};

	/**
  * Update the last position.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchMove = function (event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};

	/**
  * Attempt to find the labelled control for the given label element.
  *
  * @param {EventTarget|HTMLLabelElement} labelElement
  * @returns {Element|null}
  */
	FastClick.prototype.findControl = function (labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};

	/**
  * On touch end, determine whether to send a click event at once.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchEnd = function (event) {
		var forElement,
		    trackingClickStart,
		    targetTagName,
		    scrollParent,
		    touch,
		    targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if (event.timeStamp - this.lastClickTime < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === 'input') {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};

	/**
  * On touch cancel, stop tracking the click.
  *
  * @returns {void}
  */
	FastClick.prototype.onTouchCancel = function () {
		this.trackingClick = false;
		this.targetElement = null;
	};

	/**
  * Determine mouse events which should be permitted.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onMouse = function (event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};

	/**
  * On actual clicks, determine whether this is a touch-generated click, a click action occurring
  * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
  * an actual click which should be permitted.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onClick = function (event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};

	/**
  * Remove all FastClick's event listeners.
  *
  * @returns {void}
  */
	FastClick.prototype.destroy = function () {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};

	/**
  * Check whether FastClick is needed.
  *
  * @param {Element} layer The layer to listen on
  */
	FastClick.notNeeded = function (layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

				// Chrome desktop doesn't need FastClick (issue #15)
			} else {
					return true;
				}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};

	/**
  * Factory method for creating a FastClick object
  *
  * @param {Element} layer The layer to listen on
  * @param {Object} [options={}] The options to override the defaults
  */
	FastClick.attach = function (layer, options) {
		return new FastClick(layer, options);
	};

	if (typeof define === 'function' && _typeof(define.amd) === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function () {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
})();

},{}],2:[function(require,module,exports){
'use strict';

var _merge = require("./../lodash/object/merge");

module.exports = _merge({}, require('./src/page'), require('./src/user'));

},{"./../lodash/object/merge":47,"./src/page":3,"./src/user":4}],3:[function(require,module,exports){
'use strict';

var _isEmpty = require("./../../lodash/lang/isEmpty");

module.exports.page = function () {
	var result = {};
	var nameMappings = {
		'pageUUID': 'uuid',
		'articleUUID': 'auuid'
	};

	['pageUUID', 'articleUUID', 'siteMapTerm', 'navEdition', 'brandName', 'primaryThemeName'].forEach(function (item) {
		if (!_isEmpty(window[item])) {
			result[nameMappings[item] || item] = window[item];
		}
	});

	result.dfpSite = FT.env.dfp_site;
	result.dfpZone = FT.env.dfp_zone;
	return result;
};

},{"./../../lodash/lang/isEmpty":35}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils/cookie.js');
var _isFunction = require("./../../lodash/lang/isFunction");
var _merge = require("./../../lodash/object/merge");

module.exports.user = function (orignals) {
	var aysc = module.exports.getAyscVars({});
	var loginInfo = module.exports.getLoginInfo();
	var result = {
		homepage_edition: aysc['28'],
		corporate_access_id_code: aysc['27'],
		phone_area_code: aysc['26'],
		continent: aysc['24'],
		subscription_level: aysc.slv,
		active_personal_investor: aysc['20'],
		company_size: aysc['19'],
		post_code: aysc['12'],
		job_position: aysc['07'],
		job_responsibility: aysc['06'],
		industry: aysc['05'],
		state: aysc['04'],
		gender: aysc['02'],
		DB_company_size: aysc['40'],
		DB_industry: aysc['41'],
		DB_company_turnover: aysc['42'],
		cameo_country_code: aysc['43'],
		cameo_local_code: aysc['44'],
		DB_country_code: aysc['45'],
		cameo_investor_code: aysc['46'],
		cameo_property_code: aysc['51'],
		eid: loginInfo.eid,
		loggedIn: loginInfo.loggedIn
	};

	//strip undefined keys
	return orignals ? _merge({}, aysc, loginInfo) : _merge({}, result);
};

module.exports.getAyscVars = function (overrides) {
	var result = AYSCtoObject();
	result.slv = isCorporateUser() || getSubscriptionLevel();
	result.eid = utils.getCookieParam('FT_U', 'EID');
	return _merge({}, overrides, result);
};

function isCorporateUser() {
	return (utils.getCookieParam('AYSC', 97) || '').toLowerCase() === 'c' && 'cor';
}

function getSubscriptionLevel(info) {
	var result = 'anon';
	var subscriberInfo = utils.getCookieParam('AYSC', 22) || '';
	if (/(P|L)0/i.test(subscriberInfo)) {
		result = 'reg';
	}

	if (/(P|L)1(?!na)/i.test(subscriberInfo)) {
		result = 'lv1';
	}

	if (/(P|L)2(?!na)/i.test(subscriberInfo)) {
		result = 'lv2';
	}

	if (/(P|L)6/i.test(subscriberInfo)) {
		result = 'wkd';
	}
	return result;
}

function AYSCtoObject() {
	var result = {};
	if (utils.cookie("AYSC")) {
		for (var index = 1; index < 100; index++) {
			var param = ('0' + index).substr(-2);
			var value = utils.getCookieParam('AYSC', param);

			if (value && !/PVT|(^x+$)/i.test(value)) {
				if (param === '19' || param === '21') {
					result[param] = value.replace(/^0+/, '');
				} else if (param === '24') {
					result[param] = value;
					result.cn = value.substr(0, 3);
				} else {
					result[param] = value;
				}
			}
		}
	}
	return result;
}

module.exports.getLoginInfo = function () {
	var loggedIn = false;
	var eid = utils.getCookieParam('FT_U', 'EID') || null;
	var remember = utils.cookie('FT_Remember');

	// TODO fix the utils hash method to not error when undefined is passed
	// then we can get rid of the test for the split method
	if (!eid && remember && _isFunction(remember.split)) {
		remember = remember.split(':');
		eid = !!remember[0].length ? remember[0] : eid;
	}

	if (eid || utils.cookie('FTSession')) {
		loggedIn = true;
	}

	return { eid: eid, loggedIn: loggedIn };
};

},{"./../../lodash/lang/isFunction":36,"./../../lodash/object/merge":47,"./utils/cookie.js":5}],5:[function(require,module,exports){
/**
 * Utility methods for reading.writing cookie. Inspired by the jQuery Cookie plugin (https://github.com/carhartl/jquery-cookie).
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils/cookie
 * @see utils
 */

'use strict';

var _extend = require("./../../../lodash/object/extend"),
    pluses = /\+/g,
    today = new Date();

function raw(s) {
	return s;
}

function decoded(s) {
	return decodeURIComponent(s.replace(pluses, ' '));
}

/*
*	Read or write a cookie
* @exports utils/cookie
* @param {string} key the name of the cookie to be read/written
* @param {string} value The value to set to the written cookie (if param is missing the cookie will be read)
* @param {object} options Expires,
*/
var config = module.exports.cookie = function (key, value, options) {
	// write
	if (value !== undefined) {
		options = _extend({}, config.defaults, options);

		if (value === null) {
			options.expires = -1;
		}

		if (typeof options.expires === 'number') {
			var days = options.expires,
			    t = options.expires = new Date();
			t.setDate(t.getDate() + days);
		}

		value = config.json ? JSON.stringify(value) : String(value);
		value = config.raw ? value : encodeURIComponent(value);
		if (!!options.expires && options.expires.valueOf() - today.valueOf() < 0) {
			delete module.exports.cookies[encodeURIComponent(key)];
		} else {
			module.exports.cookies[encodeURIComponent(key)] = value;
		}

		return document.cookie = [encodeURIComponent(key), '=', value, options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
		options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join('');
	}

	// read
	var decode = config.raw ? raw : decoded;
	var cookie = module.exports.cookies[encodeURIComponent(key)];
	if (!!cookie || cookie === '') {
		return config.json ? JSON.parse(decode(cookie)) : decode(cookie);
	}

	return null;
};

config.defaults = {};

/*
* Delete a cookie
* @exports utils/cookie/removeCookie
* @param {string} name The cookie's name
* @param {object} options see options above
*/
module.exports.removeCookie = function (key, options) {
	if (module.exports.cookie(key) !== null) {
		module.exports.cookie(key, null, options);
		return true;
	}

	return false;
};

/*
* Get the regex required to parse values from a cookie
* @private
* @param {string} name The cookie's name
* @param {string} param The parameter's name
* @return {string|undefined}
*/
function getRegExp(name, param) {
	var re,
	    formats = {
		"AYSC": "underscore",
		"FT_U": "underscoreEquals",
		"FT_Remember": "colonEquals",
		"FT_User": "colonEquals",
		"FTQA": "commaEquals"
	};

	switch (formats[name]) {
		case "underscore":
			re = '_' + param + '([^_]*)_';
			break;
		case "underscoreEquals":
			re = '_' + param + '=([^_]*)_';
			break;
		case "colonEquals":
			re = ':' + param + '=([^:]*)';
			break;
		case "commaEquals":
			re = param + '=([^,]*)';
			break;
		default:
			re = /((.|\n)*)/; // match everything
			break;
	}
	return new RegExp(re);
}

/*
* Get a parameter from a named cookie
* @exports utils/cookie/getCookieParam
* @param {string} name The cookie's name
* @param {string} param The parameter's name
* @return {string|undefined}
*/
module.exports.getCookieParam = function (name, param) {
	var matches,
	    wholeValue = module.exports.cookie(name) || "";
	if (param) {
		matches = wholeValue.match(getRegExp(name, param));
	}

	return matches && matches.length ? matches[1] : undefined;
};

/*
 * Create an object hash from a delimited string
 * Beware all properties on the resulting object will have string values.
 * @param {string}        str       The string to transform
 * @param {string|regexp} delimiter The character that delimits each name/value pair
 * @param {string}        pairing   The character that separates the name from the value
 * @return {object}
 *
 */
function hash(str, delimiter, pairing) {
	var pair,
	    value,
	    idx,
	    len,
	    hash = {};
	if (str && str.split) {
		str = str.split(delimiter);

		for (idx = 0, len = str.length; idx < len; idx += 1) {
			value = str[idx];
			pair = value.split(pairing);
			if (pair.length > 1) {
				hash[pair[0].trim()] = pair.slice(1).join(pairing);
			}
		}
	}

	return hash;
};

/*
* Parse document.cookie into an object for easier reading
* @name cookies
* @member cookie
*/
module.exports.cookies = hash(document.cookie, ';', '=');

},{"./../../../lodash/object/extend":44}],6:[function(require,module,exports){
/*jshint browser:true, node:true*/

'use strict';

module.exports = Delegate;

/**
 * DOM event delegator
 *
 * The delegator will listen
 * for events that bubble up
 * to the root node.
 *
 * @constructor
 * @param {Node|string} [root] The root node or a selector string matching the root node
 */
function Delegate(root) {

  /**
   * Maintain a map of listener
   * lists, keyed by event name.
   *
   * @type Object
   */
  this.listenerMap = [{}, {}];
  if (root) {
    this.root(root);
  }

  /** @type function() */
  this.handle = Delegate.prototype.handle.bind(this);
}

/**
 * Start listening for events
 * on the provided DOM element
 *
 * @param  {Node|string} [root] The root node or a selector string matching the root node
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.root = function (root) {
  var listenerMap = this.listenerMap;
  var eventType;

  // Remove master event listeners
  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }
    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  }

  // If no root or root is not
  // a dom node, then remove internal
  // root reference and exit here
  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }
    return this;
  }

  /**
   * The root node at which
   * listeners are attached.
   *
   * @type Node
   */
  this.rootElement = root;

  // Set up master event listeners
  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }
  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }

  return this;
};

/**
 * @param {string} eventType
 * @returns boolean
 */
Delegate.prototype.captureForType = function (eventType) {
  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
};

/**
 * Attach a handler to one
 * event for all elements
 * that match the selector,
 * now or in the future
 *
 * The handler function receives
 * three arguments: the DOM event
 * object, the node that matched
 * the selector while the event
 * was bubbling and a reference
 * to itself. Within the handler,
 * 'this' is equal to the second
 * argument.
 *
 * The node that actually received
 * the event can be accessed via
 * 'event.target'.
 *
 * @param {string} eventType Listen for these events
 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
 * @param {function()} handler Handler function - event data passed here will be in event.data
 * @param {Object} [eventData] Data to pass in event.data
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.on = function (eventType, selector, handler, useCapture) {
  var root, listenerMap, matcher, matcherParam;

  if (!eventType) {
    throw new TypeError('Invalid event type: ' + eventType);
  }

  // handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // Fallback to sensible defaults
  // if useCapture not set
  if (useCapture === undefined) {
    useCapture = this.captureForType(eventType);
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Handler must be a type of Function');
  }

  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0];

  // Add master handler for type if not created yet
  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }
    listenerMap[eventType] = [];
  }

  if (!selector) {
    matcherParam = null;

    // COMPLEX - matchesRoot needs to have access to
    // this.rootElement, so bind the function to this.
    matcher = matchesRoot.bind(this);

    // Compile a matcher for the given selector
  } else if (/^[a-z]+$/i.test(selector)) {
      matcherParam = selector;
      matcher = matchesTag;
    } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
      matcherParam = selector.slice(1);
      matcher = matchesId;
    } else {
      matcherParam = selector;
      matcher = matches;
    }

  // Add to the list of listeners
  listenerMap[eventType].push({
    selector: selector,
    handler: handler,
    matcher: matcher,
    matcherParam: matcherParam
  });

  return this;
};

/**
 * Remove an event handler
 * for elements that match
 * the selector, forever
 *
 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.off = function (eventType, selector, handler, useCapture) {
  var i, listener, listenerMap, listenerList, singleEventType;

  // Handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // If useCapture not set, remove
  // all event listeners
  if (useCapture === undefined) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }

  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }

    return this;
  }

  listenerList = listenerMap[eventType];
  if (!listenerList || !listenerList.length) {
    return this;
  }

  // Remove only parameter matches
  // if specified
  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];

    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      listenerList.splice(i, 1);
    }
  }

  // All listeners removed
  if (!listenerList.length) {
    delete listenerMap[eventType];

    // Remove the main handler
    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }

  return this;
};

/**
 * Handle an arbitrary event.
 *
 * @param {Event} event
 */
Delegate.prototype.handle = function (event) {
  var i,
      l,
      type = event.type,
      root,
      phase,
      listener,
      returned,
      listenerList = [],
      target,
      /** @const */EVENTIGNORE = 'ftLabsDelegateIgnore';

  if (event[EVENTIGNORE] === true) {
    return;
  }

  target = event.target;

  // Hardcode value of Node.TEXT_NODE
  // as not defined in IE8
  if (target.nodeType === 3) {
    target = target.parentNode;
  }

  root = this.rootElement;

  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);

  switch (phase) {
    case 1:
      //Event.CAPTURING_PHASE:
      listenerList = this.listenerMap[1][type];
      break;
    case 2:
      //Event.AT_TARGET:
      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
      break;
    case 3:
      //Event.BUBBLING_PHASE:
      listenerList = this.listenerMap[0][type];
      break;
  }

  // Need to continuously check
  // that the specific list is
  // still populated in case one
  // of the callbacks actually
  // causes the list to be destroyed.
  l = listenerList.length;
  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i];

      // Bail from this loop if
      // the length changed and
      // no more listeners are
      // defined between i and l.
      if (!listener) {
        break;
      }

      // Check for match and fire
      // the event if there's one
      //
      // TODO:MCG:20120117: Need a way
      // to check if event#stopImmediatePropagation
      // was called. If so, break both loops.
      if (listener.matcher.call(target, listener.matcherParam, target)) {
        returned = this.fire(event, target, listener);
      }

      // Stop propagation to subsequent
      // callbacks if the callback returned
      // false
      if (returned === false) {
        event[EVENTIGNORE] = true;
        event.preventDefault();
        return;
      }
    }

    // TODO:MCG:20120117: Need a way to
    // check if event#stopPropagation
    // was called. If so, break looping
    // through the DOM. Stop if the
    // delegation root has been reached
    if (target === root) {
      break;
    }

    l = listenerList.length;
    target = target.parentElement;
  }
};

/**
 * Fire a listener on a target.
 *
 * @param {Event} event
 * @param {Node} target
 * @param {Object} listener
 * @returns {boolean}
 */
Delegate.prototype.fire = function (event, target, listener) {
  return listener.handler.call(target, event, target);
};

/**
 * Check whether an element
 * matches a generic selector.
 *
 * @type function()
 * @param {string} selector A CSS selector
 */
var matches = (function (el) {
  if (!el) return;
  var p = el.prototype;
  return p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
})(Element);

/**
 * Check whether an element
 * matches a tag selector.
 *
 * Tags are NOT case-sensitive,
 * except in XML (and XML-based
 * languages such as XHTML).
 *
 * @param {string} tagName The tag name to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}

/**
 * Check whether an element
 * matches the root.
 *
 * @param {?String} selector In this case this is always passed through as null and not used
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesRoot(selector, element) {
  /*jshint validthis:true*/
  if (this.rootElement === window) return element === document;
  return this.rootElement === element;
}

/**
 * Check whether the ID of
 * the element in 'this'
 * matches the given ID.
 *
 * IDs are case-sensitive.
 *
 * @param {string} id The ID to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesId(id, element) {
  return id === element.id;
}

/**
 * Short hand for off()
 * and root(), ie both
 * with no parameters
 *
 * @return void
 */
Delegate.prototype.destroy = function () {
  this.off();
  this.root();
};

},{}],7:[function(require,module,exports){
'use strict';

var getNative = require('../internal/getNative');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function () {
  return new Date().getTime();
};

module.exports = now;

},{"../internal/getNative":25}],8:[function(require,module,exports){
'use strict';

var isObject = require('../lang/isObject'),
    now = require('../date/now');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it's invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : +wait || 0;
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = !!options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    lastCalled = 0;
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function complete(isCalled, id) {
    if (id) {
      clearTimeout(id);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (isCalled) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
    }
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      complete(trailingCall, maxTimeoutId);
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    complete(trailing, timeoutId);
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      } else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    } else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = undefined;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

module.exports = debounce;

},{"../date/now":7,"../lang/isObject":38}],9:[function(require,module,exports){
'use strict';

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0:
        return func.call(this, rest);
      case 1:
        return func.call(this, args[0], rest);
      case 2:
        return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],10:[function(require,module,exports){
'use strict';

var debounce = require('./debounce'),
    isObject = require('../lang/isObject');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed invocations. Provide an options object to indicate
 * that `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. Subsequent calls to the throttled function return the
 * result of the last `func` call.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 *
 * // cancel a trailing throttled call
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
}

module.exports = throttle;

},{"../lang/isObject":38,"./debounce":8}],11:[function(require,module,exports){
"use strict";

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],12:[function(require,module,exports){
"use strict";

/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],13:[function(require,module,exports){
'use strict';

var keys = require('../object/keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
      object[key] = result;
    }
  }
  return object;
}

module.exports = assignWith;

},{"../object/keys":45}],14:[function(require,module,exports){
'use strict';

var baseCopy = require('./baseCopy'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
    return source == null ? object : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"../object/keys":45,"./baseCopy":15}],15:[function(require,module,exports){
"use strict";

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],16:[function(require,module,exports){
'use strict';

var createBaseFor = require('./createBaseFor');

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./createBaseFor":23}],17:[function(require,module,exports){
'use strict';

var baseFor = require('./baseFor'),
    keysIn = require('../object/keysIn');

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

module.exports = baseForIn;

},{"../object/keysIn":46,"./baseFor":16}],18:[function(require,module,exports){
'use strict';

var arrayEach = require('./arrayEach'),
    baseMergeDeep = require('./baseMergeDeep'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isObject = require('../lang/isObject'),
    isObjectLike = require('./isObjectLike'),
    isTypedArray = require('../lang/isTypedArray'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.merge` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {Object} Returns `object`.
 */
function baseMerge(object, source, customizer, stackA, stackB) {
  if (!isObject(object)) {
    return object;
  }
  var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
      props = isSrcArr ? undefined : keys(source);

  arrayEach(props || source, function (srcValue, key) {
    if (props) {
      key = srcValue;
      srcValue = source[key];
    }
    if (isObjectLike(srcValue)) {
      stackA || (stackA = []);
      stackB || (stackB = []);
      baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
    } else {
      var value = object[key],
          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
          isCommon = result === undefined;

      if (isCommon) {
        result = srcValue;
      }
      if ((result !== undefined || isSrcArr && !(key in object)) && (isCommon || (result === result ? result !== value : value === value))) {
        object[key] = result;
      }
    }
  });
  return object;
}

module.exports = baseMerge;

},{"../lang/isArray":34,"../lang/isObject":38,"../lang/isTypedArray":41,"../object/keys":45,"./arrayEach":12,"./baseMergeDeep":19,"./isArrayLike":26,"./isObjectLike":30}],19:[function(require,module,exports){
'use strict';

var arrayCopy = require('./arrayCopy'),
    isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isPlainObject = require('../lang/isPlainObject'),
    isTypedArray = require('../lang/isTypedArray'),
    toPlainObject = require('../lang/toPlainObject');

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
  var length = stackA.length,
      srcValue = source[key];

  while (length--) {
    if (stackA[length] == srcValue) {
      object[key] = stackB[length];
      return;
    }
  }
  var value = object[key],
      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
      isCommon = result === undefined;

  if (isCommon) {
    result = srcValue;
    if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
      result = isArray(value) ? value : isArrayLike(value) ? arrayCopy(value) : [];
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      result = isArguments(value) ? toPlainObject(value) : isPlainObject(value) ? value : {};
    } else {
      isCommon = false;
    }
  }
  // Add the source value to the stack of traversed objects and associate
  // it with its merged value.
  stackA.push(srcValue);
  stackB.push(result);

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
  } else if (result === result ? result !== value : value === value) {
    object[key] = result;
  }
}

module.exports = baseMergeDeep;

},{"../lang/isArguments":33,"../lang/isArray":34,"../lang/isPlainObject":39,"../lang/isTypedArray":41,"../lang/toPlainObject":42,"./arrayCopy":11,"./isArrayLike":26}],20:[function(require,module,exports){
"use strict";

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],21:[function(require,module,exports){
'use strict';

var identity = require('../utility/identity');

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1:
      return function (value) {
        return func.call(thisArg, value);
      };
    case 3:
      return function (value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
    case 4:
      return function (accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    case 5:
      return function (value, other, key, object, source) {
        return func.call(thisArg, value, other, key, object, source);
      };
  }
  return function () {
    return func.apply(thisArg, arguments);
  };
}

module.exports = bindCallback;

},{"../utility/identity":48}],22:[function(require,module,exports){
'use strict';

var bindCallback = require('./bindCallback'),
    isIterateeCall = require('./isIterateeCall'),
    restParam = require('../function/restParam');

/**
 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function (object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= customizer ? 1 : 0;
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"../function/restParam":9,"./bindCallback":21,"./isIterateeCall":28}],23:[function(require,module,exports){
'use strict';

var toObject = require('./toObject');

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while (fromRight ? index-- : ++index < length) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{"./toObject":32}],24:[function(require,module,exports){
'use strict';

var baseProperty = require('./baseProperty');

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

},{"./baseProperty":20}],25:[function(require,module,exports){
'use strict';

var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":37}],26:[function(require,module,exports){
'use strict';

var getLength = require('./getLength'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

module.exports = isArrayLike;

},{"./getLength":24,"./isLength":29}],27:[function(require,module,exports){
'use strict';

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = typeof value == 'number' || reIsUint.test(value) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

},{}],28:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var isArrayLike = require('./isArrayLike'),
    isIndex = require('./isIndex'),
    isObject = require('../lang/isObject');

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index === 'undefined' ? 'undefined' : _typeof(index);
  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    var other = object[index];
    return value === value ? value === other : other !== other;
  }
  return false;
}

module.exports = isIterateeCall;

},{"../lang/isObject":38,"./isArrayLike":26,"./isIndex":27}],29:[function(require,module,exports){
'use strict';

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],30:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

module.exports = isObjectLike;

},{}],31:[function(require,module,exports){
'use strict';

var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('./isIndex'),
    isLength = require('./isLength'),
    keysIn = require('../object/keysIn');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = shimKeys;

},{"../lang/isArguments":33,"../lang/isArray":34,"../object/keysIn":46,"./isIndex":27,"./isLength":29}],32:[function(require,module,exports){
'use strict';

var isObject = require('../lang/isObject');

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

},{"../lang/isObject":38}],33:[function(require,module,exports){
'use strict';

var isArrayLike = require('../internal/isArrayLike'),
    isObjectLike = require('../internal/isObjectLike');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
    return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
}

module.exports = isArguments;

},{"../internal/isArrayLike":26,"../internal/isObjectLike":30}],34:[function(require,module,exports){
'use strict';

var getNative = require('../internal/getNative'),
    isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var arrayTag = '[object Array]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function (value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

module.exports = isArray;

},{"../internal/getNative":25,"../internal/isLength":29,"../internal/isObjectLike":30}],35:[function(require,module,exports){
'use strict';

var isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isArrayLike = require('../internal/isArrayLike'),
    isFunction = require('./isFunction'),
    isObjectLike = require('../internal/isObjectLike'),
    isString = require('./isString'),
    keys = require('../object/keys');

/**
 * Checks if `value` is empty. A value is considered empty unless it's an
 * `arguments` object, array, string, or jQuery-like collection with a length
 * greater than `0` or an object with own enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {Array|Object|string} value The value to inspect.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice))) {
    return !value.length;
  }
  return !keys(value).length;
}

module.exports = isEmpty;

},{"../internal/isArrayLike":26,"../internal/isObjectLike":30,"../object/keys":45,"./isArguments":33,"./isArray":34,"./isFunction":36,"./isString":40}],36:[function(require,module,exports){
'use strict';

var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 which returns 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

module.exports = isFunction;

},{"./isObject":38}],37:[function(require,module,exports){
'use strict';

var isFunction = require('./isFunction'),
    isObjectLike = require('../internal/isObjectLike');

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":30,"./isFunction":36}],38:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],39:[function(require,module,exports){
'use strict';

var baseForIn = require('../internal/baseForIn'),
    isArguments = require('./isArguments'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) || !hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function (subValue, key) {
    result = key;
  });
  return result === undefined || hasOwnProperty.call(value, result);
}

module.exports = isPlainObject;

},{"../internal/baseForIn":17,"../internal/isObjectLike":30,"./isArguments":33}],40:[function(require,module,exports){
'use strict';

var isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' || isObjectLike(value) && objToString.call(value) == stringTag;
}

module.exports = isString;

},{"../internal/isObjectLike":30}],41:[function(require,module,exports){
'use strict';

var isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

module.exports = isTypedArray;

},{"../internal/isLength":29,"../internal/isObjectLike":30}],42:[function(require,module,exports){
'use strict';

var baseCopy = require('../internal/baseCopy'),
    keysIn = require('../object/keysIn');

/**
 * Converts `value` to a plain object flattening inherited enumerable
 * properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return baseCopy(value, keysIn(value));
}

module.exports = toPlainObject;

},{"../internal/baseCopy":15,"../object/keysIn":46}],43:[function(require,module,exports){
'use strict';

var assignWith = require('../internal/assignWith'),
    baseAssign = require('../internal/baseAssign'),
    createAssigner = require('../internal/createAssigner');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it's invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function (object, source, customizer) {
    return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
});

module.exports = assign;

},{"../internal/assignWith":13,"../internal/baseAssign":14,"../internal/createAssigner":22}],44:[function(require,module,exports){
'use strict';

module.exports = require('./assign');

},{"./assign":43}],45:[function(require,module,exports){
'use strict';

var getNative = require('../internal/getNative'),
    isArrayLike = require('../internal/isArrayLike'),
    isObject = require('../lang/isObject'),
    shimKeys = require('../internal/shimKeys');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function (object) {
  var Ctor = object == null ? undefined : object.constructor;
  if (typeof Ctor == 'function' && Ctor.prototype === object || typeof object != 'function' && isArrayLike(object)) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

},{"../internal/getNative":25,"../internal/isArrayLike":26,"../internal/shimKeys":31,"../lang/isObject":38}],46:[function(require,module,exports){
'use strict';

var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('../internal/isIndex'),
    isLength = require('../internal/isLength'),
    isObject = require('../lang/isObject');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = index + '';
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"../internal/isIndex":27,"../internal/isLength":29,"../lang/isArguments":33,"../lang/isArray":34,"../lang/isObject":38}],47:[function(require,module,exports){
'use strict';

var baseMerge = require('../internal/baseMerge'),
    createAssigner = require('../internal/createAssigner');

/**
 * Recursively merges own enumerable properties of the source object(s), that
 * don't resolve to `undefined` into the destination object. Subsequent sources
 * overwrite property assignments of previous sources. If `customizer` is
 * provided it's invoked to produce the merged values of the destination and
 * source properties. If `customizer` returns `undefined` merging is handled
 * by the method instead. The `customizer` is bound to `thisArg` and invoked
 * with five arguments: (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var users = {
 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
 * };
 *
 * var ages = {
 *   'data': [{ 'age': 36 }, { 'age': 40 }]
 * };
 *
 * _.merge(users, ages);
 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
 *
 * // using a customizer callback
 * var object = {
 *   'fruits': ['apple'],
 *   'vegetables': ['beet']
 * };
 *
 * var other = {
 *   'fruits': ['banana'],
 *   'vegetables': ['carrot']
 * };
 *
 * _.merge(object, other, function(a, b) {
 *   if (_.isArray(a)) {
 *     return a.concat(b);
 *   }
 * });
 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
 */
var merge = createAssigner(baseMerge);

module.exports = merge;

},{"../internal/baseMerge":18,"../internal/createAssigner":22}],48:[function(require,module,exports){
"use strict";

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],49:[function(require,module,exports){
'use strict';

var dispatchCustomEvent = require('../utils/dispatchCustomEvent');

var copy = function copy(root) {
	this.root = root || document;
};

copy.prototype.track = function () {

	this.root.addEventListener('copy', function (e) {

		var element = e.target;
		var data = {
			action: 'copy',
			category: 'text',
			context: {
				nodeName: element.nodeName.toLowerCase(),
				product: 'next'
			}
		};

		if (window.getSelection) {
			var selection = window.getSelection().toString();
			data.context.characters = selection.length;
			data.context.words = Math.ceil(selection.split(/\b/).length / 2);
			if (selection.length > 100) {
				data.selection = selection.substr(0, 47) + ' ... ' + selection.substr(-47);
			} else {
				data.selection = selection;
			}
		}
		dispatchCustomEvent('oTracking.event', data);
	});
};

module.exports = copy;

},{"../utils/dispatchCustomEvent":54}],50:[function(require,module,exports){
'use strict';

var getDomPath = require('../utils/getDomPath');
var getDomPathString = require('../utils/getDomPathString');
var Delegate = require("./../../../ftdomdelegate/lib/delegate.js");

var dispatchCustomEvent = require('../utils/dispatchCustomEvent');

var CTA = function CTA() {
	this.allowedElementsSelector = 'a, button, input[type="checkbox"]';
	this.delegate = new Delegate();
};

// Event delegate for all clicks on the document. Rebroadcasts them as
// 'trackable' events if the approriate data attribute is found.
CTA.prototype.track = function (root) {
	this.delegate.root(root);
	this.clickHandler = (function (e, element) {
		var nodeName = element.nodeName.toLowerCase();
		var isTrackable = element.hasAttribute('data-trackable');

		if (!isTrackable) {
			return true;
		}

		var meta = element.getAttribute('data-trackable-meta');
		meta = meta ? JSON.parse(meta) : {};

		meta.nodeName = nodeName;
		meta.domPath = getDomPathString(element);
		meta.domPressed = element.hasAttribute('aria-pressed');
		meta.domPathTokens = getDomPath(element, []).reverse();
		meta.target = element.getAttribute('data-trackable');
		meta.conceptId = element.getAttribute('data-concept-id');
		meta.contentId = element.getAttribute('data-content-id');
		meta.category = 'click';
		meta.action = 'cta';
		meta.referrer = document.referrer;
		meta.url = document.location.href;
		dispatchCustomEvent('oTracking.event', meta);
	}).bind(this);

	// Event capture avoids missing events that has been prevented from bubbling
	this.delegate.on('click', this.allowedElementsSelector, this.clickHandler, true);
};

CTA.prototype.destroy = function () {
	this.delegate.destroy();
};

module.exports = CTA;

},{"../utils/dispatchCustomEvent":54,"../utils/getDomPath":55,"../utils/getDomPathString":56,"./../../../ftdomdelegate/lib/delegate.js":6}],51:[function(require,module,exports){
'use strict';

var dispatchCustomEvent = require('../utils/dispatchCustomEvent');

var NavigationTiming = function NavigationTiming() {};

NavigationTiming.prototype.track = function () {

	window.addEventListener('load', function load() {

		var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

		if (!performance || !('timing' in performance)) {
			return false;
		}

		if (!/spoor-id=0/.test(document.cookie)) {
			return false;
		}

		// http://stackoverflow.com/questions/7606972/measuring-site-load-times-via-performance-api
		setTimeout(function () {

			var timing = performance.timing;
			var start = timing.navigationStart;
			var domLoadingStart = timing.domLoading;

			// stepped timings - each metric is calculated from the previous stage
			var stepped = {
				domReadyTime: timing.domComplete - timing.domInteractive,
				readyStart: timing.fetchStart - timing.navigationStart,
				redirectTime: timing.redirectEnd - timing.redirectStart,
				appcacheTime: timing.domainLookupStart - timing.fetchStart,
				unloadEventTime: timing.unloadEventEnd - timing.unloadEventStart,
				lookupDomainTime: timing.domainLookupEnd - timing.domainLookupStart,
				connectTime: timing.connectEnd - timing.connectStart,
				requestTime: timing.responseEnd - timing.requestStart,
				initDomTreeTime: timing.domInteractive - timing.responseEnd,
				loadEventTime: timing.loadEventEnd - timing.loadEventStart,
				loadTime: timing.loadEventEnd - timing.fetchStart
			};

			// offset timings - each metrics is calculated from the first event, i.e. navigation start
			var offset = {
				navigationStart: timing.navigationStart - start,
				unloadEventStart: timing.unloadEventStart - start,
				unloadEventEnd: timing.unloadEventEnd - start,
				redirectStart: timing.redirectStart - start,
				redirectEnd: timing.redirectEnd - start,
				fetchStart: timing.fetchStart - start,
				domainLookupStart: timing.domainLookupStart - start,
				domainLookupEnd: timing.domainLookupEnd - start,
				connectStart: timing.connectStart - start,
				connectEnd: timing.connectEnd - start,
				secureConnectionStart: timing.secureConnectionStart - start,
				requestStart: timing.requestStart - start,
				responseStart: timing.responseStart - start,
				responseEnd: timing.responseEnd - start,
				domLoading: timing.domLoading - start,
				domInteractive: timing.domInteractive - start,
				domContentLoadedEventStart: timing.domContentLoadedEventStart - start,
				domContentLoadedEventEnd: timing.domContentLoadedEventEnd - start,
				domComplete: timing.domComplete - start,
				loadEventStart: timing.loadEventStart - start,
				loadEventEnd: timing.loadEventEnd - start
			};

			var outlier = Array.from(offset).filter(function (item) {
				return item < 0 || item > 70000; // 70s browser timeout
			}).length;

			if (outlier) {
				return false;
			}

			// metrics are calculated from the domLoading event (i.e. without connection, etc timings)
			var domLoadingOffset = {
				domInteractive: timing.domInteractive - domLoadingStart,
				domContentLoadedEventStart: timing.domContentLoadedEventStart - domLoadingStart,
				domContentLoadedEventEnd: timing.domContentLoadedEventEnd - domLoadingStart,
				domComplete: timing.domComplete - domLoadingStart,
				loadEventStart: timing.loadEventStart - domLoadingStart,
				loadEventEnd: timing.loadEventEnd - domLoadingStart
			};

			var marks = performance.getEntriesByType ? performance.getEntriesByType('mark').reduce(function (currentMarks, mark) {
				currentMarks[mark.name] = mark.startTime;
				domLoadingOffset[mark.name] = mark.startTime - offset.domLoading;
				return currentMarks;
			}, {}) : {};

			var customTimings = {};

			// cribbed from https://github.com/addyosmani/timing.js/blob/master/timing.js
			var firstPaint = null;
			var chromeObj = window.chrome;
			if (chromeObj && chromeObj.loadTimes) {
				firstPaint = chromeObj.loadTimes().firstPaintTime * 1000 - chromeObj.loadTimes().startLoadTime * 1000;
			} else if (typeof performance.timing.msFirstPaint === 'number') {
				firstPaint = performance.timing.msFirstPaint - start;
			}
			if (firstPaint) {
				customTimings.firstPaint = firstPaint;
				domLoadingOffset.firstPaint = firstPaint - offset.domLoading;
			}

			dispatchCustomEvent('oTracking.event', {
				category: 'page-load',
				action: 'timing',
				timings: {
					offset: offset,
					domLoadingOffset: domLoadingOffset,
					stepped: stepped,
					marks: marks,
					custom: customTimings
				}
			});
		}, 0);
	});
};

module.exports = NavigationTiming;

},{"../utils/dispatchCustomEvent":54}],52:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var oViewport = require("./../../../o-viewport/main.js");
var dispatchCustomEvent = require('../utils/dispatchCustomEvent');
var ATTENTION_INTERVAL = 5000;
var ATTENTION_EVENTS = ['load', 'click', 'focus', 'scroll', 'mousemove', 'touchstart', 'touchend', 'touchcancel', 'touchleave'];
var UNATTENTION_EVENTS = ['blur'];
var eventToSend = 'onbeforeunload' in window ? 'beforeunload' : 'unload';

var Attention = (function () {
	function Attention() {
		_classCallCheck(this, Attention);

		this.totalAttentionTime = 0;
		this.startAttentionTime;
		this.endAttentionTime;
	}

	_createClass(Attention, [{
		key: 'init',
		value: function init() {
			var _this = this;

			//Add events for all the other Attention events
			for (var i = 0; i < ATTENTION_EVENTS.length; i++) {
				window.addEventListener(ATTENTION_EVENTS[i], function (ev) {
					return _this.startAttention(ev);
				});
			}

			for (var i = 0; i < UNATTENTION_EVENTS.length; i++) {
				window.addEventListener(UNATTENTION_EVENTS[i], function (ev) {
					return _this.endAttention(ev);
				});
			}

			oViewport.listenTo('visibility');
			document.body.addEventListener('oViewport.visibility', function (ev) {
				return _this.handleVisibilityChange(ev);
			}, false);

			this.addVideoEvents();

			// Add event to send data on unload
			window.addEventListener(eventToSend, function () {
				_this.endAttention();
				dispatchCustomEvent('oTracking.event', {
					category: 'page',
					action: 'interaction',
					context: {
						attention: {
							total: _this.totalAttentionTime
						}
					}
				});
			});
		}
	}, {
		key: 'startAttention',
		value: function startAttention() {
			var _this2 = this;

			clearTimeout(this.attentionTimeout);
			if (!this.startAttentionTime) {
				this.startAttentionTime = new Date().getTime();
			}
			this.attentionTimeout = setTimeout(function () {
				return _this2.endAttention();
			}, ATTENTION_INTERVAL);
		}
	}, {
		key: 'startConstantAttention',
		value: function startConstantAttention() {
			var _this3 = this;

			this.constantAttentionInterval = setInterval(function () {
				return _this3.startAttention();
			}, ATTENTION_INTERVAL);
		}
	}, {
		key: 'endConstantAttention',
		value: function endConstantAttention() {
			this.endAttention();
			clearInterval(this.constantAttentionInterval);
		}
	}, {
		key: 'endAttention',
		value: function endAttention() {
			if (this.startAttentionTime) {
				this.endAttentionTime = new Date().getTime();
				this.totalAttentionTime += Math.round((this.endAttentionTime - this.startAttentionTime) / 1000);
				clearTimeout(this.attentionTimeout);
				this.startAttentionTime = null;
			}
		}
	}, {
		key: 'addVideoEvents',
		value: function addVideoEvents() {
			var _this5 = this;

			this.videoPlayers;
			if (window.FTVideo) {
				this.videoPlayers = document.getElementsByClassName('BrightcoveExperience');
				for (var i = 0; i < this.videoPlayers.length; i++) {
					window.FTVideo.createPlayerAsync(this.videoPlayers[i].id, function (player) {
						var _this4 = this;

						player.on(player.MEDIA_PLAY_EVENT, function (ev) {
							return _this4.startConstantAttention(ev);
						});
						player.on(player.MEDIA_STOP_EVENT, function (ev) {
							return _this4.endConstantAttention(ev);
						});
					});
				}
			} else {
				this.videoPlayers = document.getElementsByTagName('video');
				for (var i = 0; i < this.videoPlayers.length; i++) {
					this.videoPlayers[i].addEventListener('playing', function (ev) {
						return _this5.startConstantAttention(ev);
					});
					this.videoPlayers[i].addEventListener('pause', function (ev) {
						return _this5.endConstantAttention(ev);
					});
					this.videoPlayers[i].addEventListener('ended', function (ev) {
						return _this5.endConstantAttention(ev);
					});
				}
			}
		}
	}, {
		key: 'handleVisibilityChange',
		value: function handleVisibilityChange(ev) {
			if (ev.detail.hidden) {
				this.endAttention();
			} else {
				this.startAttention();
			}
		}
	}]);

	return Attention;
})();

module.exports = Attention;

},{"../utils/dispatchCustomEvent":54,"./../../../o-viewport/main.js":133}],53:[function(require,module,exports){
'use strict';

var Timing = require('./analytics/navigation-timing');
var Cta = require('./analytics/cta');
var Copy = require('./analytics/copy');
var Attention = require('./analytics/page-attention');

var Analytics = function Analytics() {};

Analytics.prototype.init = function () {

	// Initialise any call-to-action tracking code
	this.cta = new Cta();
	this.cta.track(document.body);

	// text copy -> clipboard tracking
	this.copy = new Copy(document.body);
	this.copy.track();
	this.attention = new Attention();
	this.attention.init();

	// Nav timing - https://developer.mozilla.org/en-US/docs/Navigation_timing
	new Timing().track();
};

Analytics.prototype.destroy = function () {
	this.cta.destroy();
};

module.exports = new Analytics();

},{"./analytics/copy":49,"./analytics/cta":50,"./analytics/navigation-timing":51,"./analytics/page-attention":52}],54:[function(require,module,exports){
"use strict";

module.exports = function (name, data) {
	var rootEl = document.body;
	var event = (function () {
		try {
			return new CustomEvent(name, { bubbles: true, cancelable: true, detail: data });
		} catch (e) {
			return CustomEvent.initCustomEvent(name, true, true, data);
		}
	})();

	rootEl.dispatchEvent(event);
};

},{}],55:[function(require,module,exports){
'use strict';

/*

Given an element this will return the _trackable path_ by traversing the DOM
ancestors.

Any ancestor with a `data-trackable` attribute will be added to the _path_.

Eg,

	<div data-trackable="foo">
		<ul>
			<li data-trackable="item 1">
				<button data-trackable="hello">hello</button>
			<li data-trackable="item 2" data-trackable-once> // handler removed after first interactiton
				..
			<li data-trackable="item 3">
				<span></span>
	</div>

So, given the BUTTON element, `getDomPath` will return `['hello', 'item 1', 'foo']`.

Given SPAN `getDomPath` will return `['item 3 | foo']`.

*/
var getDomPath = function getDomPath(el, path, depth) {

	depth = depth || 0;

	if (!el.parentNode) {
		return path;
	}

	// Transponse the parent node where the target element is a text node
	if (path.length === 0 && el.nodeType === Node.TEXT_NODE) {
		el = el.parentNode;
	}

	var trackable = el.getAttribute('data-trackable');

	if (trackable) {
		path.push(trackable);
	}

	var trackableOnce = el.hasAttribute('data-trackable-once');

	// Only track some elements once per page
	if (trackableOnce && depth === 0) {
		el.removeAttribute('data-trackable');
	}

	// Terminate the path traversal
	if (el.hasAttribute('data-trackable-terminate')) {
		return path;
	}

	return getDomPath(el.parentNode, path, depth + 1);
};

module.exports = getDomPath;

},{}],56:[function(require,module,exports){
'use strict';

var getDomPath = require('./getDomPath');

var getDomPathString = function getDomPathString(element) {
	return getDomPath(element, []).reverse().join(' | ');
};

module.exports = getDomPathString;

},{"./getDomPath":55}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var jsonpCallbackNames = [];

var generateCallbackName = function generateCallbackName() {
	var base = 'jsonpCallback';
	var callbackName = base + '_' + (jsonpCallbackNames.length + 1);
	jsonpCallbackNames.push(callbackName);
	return callbackName;
};

var crossDomainFetch = function crossDomainFetch() {
	var crossDomainFetch = 'withCredentials' in new XMLHttpRequest() ? fetch : jsonpFetch;
	return crossDomainFetch.apply(undefined, arguments);
};

var jsonpFetch = function jsonpFetch(url, opts) {
	var defaultOpts = {
		timeout: 2000
	};
	opts = opts || {};
	Object.keys(defaultOpts).forEach(function (defaultOptsKey) {
		if (!opts.hasOwnProperty(defaultOptsKey)) {
			opts[defaultOptsKey] = defaultOpts[defaultOptsKey];
		}
	});
	return new Promise(function (resolve, reject) {
		var callbackName = generateCallbackName();
		var timeout = undefined;
		window.FT = window.FT || {};
		window.FT[callbackName] = function (response) {
			var status = response.status ? response.status : 200;
			resolve({
				ok: Math.floor(status / 100) === 2,
				status: status,
				json: function json() {
					return Promise.resolve(response.body || response);
				}
			});
			if (timeout) {
				clearTimeout(timeout);
			}
		};

		var scriptTag = document.createElement('script');
		scriptTag.defer = true;
		scriptTag.src = '' + url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=FT.' + callbackName;
		document.body.appendChild(scriptTag);

		timeout = setTimeout(function () {
			reject(new Error('JSONP request to ' + url + ' timed out'));
		}, opts.timeout);
	});
};

exports.default = jsonpFetch;
exports.crossDomainFetch = crossDomainFetch;

},{}],58:[function(require,module,exports){
'use strict';

// Loads Google Floodlight
module.exports = function (flags) {

	var isAnonymous = !/FTSession/.test(document.cookie);
	var spoorId = /spoor-id=([^;]+)/.exec(document.cookie);

	if (flags && flags.get('floodlight') && isAnonymous && spoorId) {
		var i = new Image();
		i.src = 'https://4235225.fls.doubleclick.net/activityi;src=4235225;type=homeo886;cat=ft-ne000;u10=' + spoorId[1] + ';dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1;num=1';
	}
};

},{}],59:[function(require,module,exports){
"use strict";

/*global Track*/

var trackMdotRedirects = function trackMdotRedirects() {

	// If the user has just arrived as part of the m.ft.com migration,
	// fire an iJento event to track them
	if (/mDotForcedOptIn/.test(document.cookie)) {
		try {
			Track.IJento.getSiTracker().sendAdditionalTracer("/eventonpage", "type=mDotOptIn&data=true");
			console.log('Sent mDotOptIn event to iJento');
		} catch (e) {
			console.log('Failed to track mDotOptIn event has iJento been removed?');
		}

		// Delete the cookie, because we only need a single event in iJento for the user
		document.cookie = "mDotForcedOptIn=; expires=" + new Date(1995, 11, 17).toGMTString() + '; path=/; domain=.ft.com';
	}
};

// iJento
// Note: `/__ijento/` URLs resolve to javascript for next.ft.com URLs.

module.exports = function (flags) {

	if (flags && flags.get('analytics')) {

		if (!location.pathname) {
			return;
		}

		var iJentoScript = document.createElement('script');
		iJentoScript.async = iJentoScript.defer = true;
		iJentoScript.src = '//next.ft.com/__ijento' + (window.ijentoConfig ? '' : '/' + location.pathname.slice(1));
		if (iJentoScript.hasOwnProperty('onreadystatechange')) {
			iJentoScript.onreadystatechange = function () {
				if (iJentoScript.readyState === "loaded") {
					trackMdotRedirects();
				}
			};
		} else {
			iJentoScript.onload = trackMdotRedirects;
		}

		document.body.appendChild(iJentoScript);
	}
};

},{}],60:[function(require,module,exports){
'use strict';

// Selects ~15% with an allocation id (allocation is a hexidecimal, i.e. so first 2
// characters has 255 possible values)
var allocate = function allocate(str) {
	return (/FTAllocation=1/.test(str)
	);
};

var getSessionToken = function getSessionToken() {
	var s = /FTSession=([^;]+)/i.exec(document.cookie);
	return s ? s[1] : undefined;
};

var getAllocationId = function getAllocationId() {
	var a = /FTAllocation=([^;]+)/i.exec(document.cookie);
	return a ? a[1] : undefined;
};

// Loads session cam tracking code
module.exports = function (flags) {

	var inSample = allocate(document.cookie); // scope to a % of users
	var isLargeDevice = screen.width >= 768; // avoid small devices as it sends back a lot of HTTP traffic.

	// sessioncamforce is needed for staff etc. as we'll need to force it on
	if (flags && (flags.get('sessioncamforce') || flags.get('inspectlet') && isLargeDevice && inSample)) {

		fetch('https://ammit.ft.com/segment', {
			timeout: 2000,
			credentials: 'include',
			headers: {
				'ft-session-token': getSessionToken(),
				'ft-allocation-id': getAllocationId()
			}
		}).then(function (res) {

			if (!res) {
				return;
			}

			var allocation = res.headers.get('x-ft-ab');

			window.__insp = window.__insp || [];
			window.__insp.push(['wid', 1422358241]);
			window.__insp.push(['identify', getAllocationId()]);

			// frontpage:control,moreon:variant -> { frontpage: 'control', moreon: 'variant' }
			var ammit = {};
			if (allocation) {
				allocation.split(',').forEach(function (test) {
					var a = test.split(':');
					ammit[a[0]] = a[1];
				});
				window.__insp.push(['tagSession', ammit]);
			}

			var s = document.createElement('script');
			s.async = s.defer = true;
			s.src = '//cdn.inspectlet.com/inspectlet.js';
			document.body.appendChild(s);
		}).catch(function (err) {
			console.log(err); /* swallow the error for now FIXME */
		});
	}
};

},{}],61:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var oTracking = require("./../../../o-tracking/main.js");
var oGrid = require("./../../../o-grid/main.js");
var oViewport = require("./../../../o-viewport/main.js");

function getRootData(name) {
	return document.documentElement.getAttribute('data-' + name);
}

var oTrackingWrapper = {
	init: function init(flags, oErrors, appInfo) {

		if (!flags || !flags.get('oTracking')) {
			return;
		}

		// oTracking sometimes errors - this makes sure that if it does it won't bring the whole bootstrap process down with it
		try {
			var userData = {
				layout: oGrid.getCurrentLayout(),
				orientation: oViewport.getOrientation()
			};

			var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

			if (connection && connection.type) {
				userData.connectionType = connection.type;
			}

			var context = {
				product: 'next',
				app: appInfo && appInfo.name,
				appVersion: appInfo && appInfo.version
			};

			var contentId = getRootData('content-id');
			if (contentId) {
				context.rootContentId = contentId;
			}

			var conceptId = getRootData('concept-id');
			if (conceptId) {
				context.rootConceptId = conceptId;
				context.rootTaxonomy = getRootData('taxonomy');
			}

			var errorStatus = (/nextErrorStatus=(\d{3})/.exec(window.location.search) || [])[1];
			var pageViewConf = { context: {} };

			if (errorStatus) {
				// TODO after https://github.com/Financial-Times/o-tracking/issues/122#issuecomment-194970465
				// this should be redundant as context woudl propagate down to each event in its entirety
				context.url = pageViewConf.context.url = window.parent.location.toString();
				context.referrer = pageViewConf.context.referrer = window.parent.document.referrer;
				context.errorStatus = pageViewConf.context.errorStatus = errorStatus;
			}

			oTracking.init({
				server: 'https://spoor-api.ft.com/ingest',
				context: context,
				user: userData,
				useSendBeacon: flags.get('sendBeacon')
			});

			if (!document.querySelector('[data-barrier]')) {
				// The page url and referrer automatically populated by o-tracking
				oTracking.page(pageViewConf.context);
			}
		} catch (err) {
			if ((typeof oErrors === 'undefined' ? 'undefined' : _typeof(oErrors)) === 'object' && typeof oErrors.error === 'function') {
				oErrors.error('Failed to init oTracking.  Message=' + err.message);
			}
		}
	}
};

module.exports = oTrackingWrapper;

},{"./../../../o-grid/main.js":114,"./../../../o-tracking/main.js":116,"./../../../o-viewport/main.js":133}],62:[function(require,module,exports){
'use strict';

// Selects ~15% with an allocation id (allocation is a hexidecimal, i.e. so first 2
// characters has 255 possible values)
var allocate = function allocate(str) {
	return (/FTAllocation=0/.test(str)
	);
};

var getSessionToken = function getSessionToken() {
	var s = /FTSession=([^;]+)/i.exec(document.cookie);
	return s ? s[1] : undefined;
};

var getAllocationId = function getAllocationId() {
	var a = /FTAllocation=([^;]+)/i.exec(document.cookie);
	return a ? a[1] : undefined;
};

// Loads session cam tracking code
module.exports = function (flags) {

	var inSample = allocate(document.cookie); // scope to a % of users
	var isLargeDevice = screen.width >= 768; // avoid small devices as it sends back a lot of HTTP traffic.

	// sessioncamforce is needed for staff etc. as we'll need to force it on
	if (flags && (flags.get('sessioncamforce') || flags.get('sessioncam') && isLargeDevice && inSample)) {

		fetch('https://ammit.ft.com/segment', {
			timeout: 2000,
			credentials: 'include',
			headers: {
				'ft-session-token': getSessionToken(),
				'ft-allocation-id': getAllocationId()
			}
		}).then(function (res) {

			if (!res) {
				return;
			}

			var allocation = res.headers.get('x-ft-ab');

			// SessionCamHostname must be configured before loading sessioncam.recorder.js,
			// otherwise it won't work on articles.
			window.sessioncamConfiguration = window.sessioncamConfiguration || {};
			window.sessioncamConfiguration.SessionCamHostname = 'https://next.ft.com';
			window.sessioncamConfiguration.customDataObjects = [{ key: "ammit-allocation", value: allocation }];

			var s = document.createElement('script');
			s.async = s.defer = true;
			s.src = '//d2oh4tlt9mrke9.cloudfront.net/Record/js/sessioncam.recorder.js';
			document.body.appendChild(s);
		}).catch(function (err) {
			console.log(err); /* swallow the error for now FIXME */
		});
	}
};

},{}],63:[function(require,module,exports){
'use strict';

var isAllocated = function isAllocated() {
  return (/spoor-id=0/.test(document.cookie)
  );
};

// Loads Sourcepoint
module.exports = function (flags) {
  if (flags && flags.get('sourcepoint') && isAllocated()) {

    document.addEventListener('sp.blocking', function () {
      document.body.dispatchEvent(new CustomEvent('oTracking.event', {
        detail: {
          category: 'ads',
          action: 'blocked'
        },
        bubbles: true
      }));
    });

    var sp = document.createElement('script');
    sp.async = sp.defer = true;
    sp.src = 'https://h2.ft.com/static-files/sp/prod/long/sp/sp-2.js';
    sp.setAttribute('data-client-id', 'pHQAcgfacNTVtzm');
    document.body.appendChild(sp);
  }
};

},{}],64:[function(require,module,exports){
'use strict';

var nextAdsComponent = require("./../../../next-ads-component/main.js");
var krux = require('./krux');

module.exports = function (flags) {

	// TODO: Move the `ads` feature-flag check to nextAdsComponent
	if (flags && flags.get('ads')) {
		if (/(BlackBerry|BBOS|PlayBook|BB10)/.test(navigator.userAgent)) {
			return;
		}
		nextAdsComponent.init(flags).then(function () {
			if (flags && flags.get('krux')) {
				//Though krux is activated through nextAdsComponent, we also need to load all the additional user matching scripts
				//that would have been loaded via their tag manager
				krux.init(flags);
			}
		});
	}
};

},{"./../../../next-ads-component/main.js":67,"./krux":65}],65:[function(require,module,exports){
'use strict';

var Superstore = require("./../../../superstore/lib/superstore.js");
var store = new Superstore('session', 'next-krux');
var oAds = require("./../../../o-ads/main.js");

var addPixel = function addPixel(src) {
	var img = new Image();
	img.src = src;
};

// None of the Krux scripts need to run all the time since they are just matching users between various systems
// In Supertag they were (mostly) set to cap at 3 times a day. So roughly equating that to 2 times a session.

var frequencyCap = function frequencyCap(name, limit, fn) {
	var key = 'scriptExecCount_' + name;
	store.get(key).then(function (val) {
		val = val || 0;
		if (parseInt(val) < limit) {
			fn();
			store.set(key, ++val).catch(function () {});
		}
	}).catch(function () {});
};

exports.init = function (flags) {

	window.addEventListener('load', function () {
		//If local/sessionStorage unavailable, don't run any of these scripts.
		if (typeof window.Krux === 'undefined' || !Superstore.isPersisting()) {
			return;
		}

		var kuid = oAds.krux.retrieve('kuid');

		if (kuid && typeof kuid !== 'undefined') {

			// Rubicon handles programmatic advertising. This matches up the user ID formats so Krux can send segment populations to them.
			if (flags.get('kruxRubiconIntegration')) {
				frequencyCap('rubicon', 2, function () {
					addPixel('https://tap.rubiconproject.com/oz/feeds/krux/tokens?afu=' + kuid);
				});
			}

			// DoubleClick handles display advertising. This matches up the user ID formats so Krux can send segment populations to them.
			if (flags.get('kruxGoogleIntegration')) {
				frequencyCap('doubleclick', 2, function () {
					addPixel('https://apiservices.krxd.net/um?partner=google&r=https://cm.g.doubleclick.net/pixel');
				});
			}

			// The following four scripts are user matching scripts for Kruxdata partners
			// They provide 3rd party data on user Demographic (eg:	Males),	Intent	(eg:	Children's	Apparel	Buyers)
			if (flags.get('kruxAcxiomIntegration')) {
				frequencyCap('acxiom', 2, function () {
					addPixel('https://idsync.rlcdn.com/379708.gif?partner=' + kuid);
				});
			}

			if (flags.get('kruxDataLogixIntegration')) {
				frequencyCap('DataLogix', 1, function () {
					var kurlParams = encodeURIComponent('_kuid=' + kuid + '&_kdpid=2dd640a6-6ebd-4d4f-af30-af8baa441a0d&dlxid=<na_id>&dlxdata=<na_da>');
					var kurl = 'https://beacon.krxd.net/data.gif?' + kurlParams;
					addPixel('https://r.nexac.com/e/getdata.xgi?dt=br&pkey=gpwn29rvapq62&ru=' + kurl);
				});
			}

			if (flags.get('kruxIXIIntegration')) {
				frequencyCap('ixidigital', 2, function () {
					addPixel('https://kr.ixiaa.com/C726AB29-0470-440B-B8D2-D552CED3A3DC/a.gif');
				});
			}

			if (flags.get('kruxExelateIntegration')) {
				frequencyCap('exelate', 2, function () {
					addPixel('https://loadm.exelator.com/load?_kdpid=e4942ff0-4070-4896-a7ef-e6a5a30ce9f9&buid=' + kuid + '&p=204&g=270&j=0');
				});
			}

			if (flags.get('kruxAppNexusIntegration')) {

				frequencyCap('appnexus', 2, function () {
					var cacheBust = Math.round(new Date().getTime() / 1000);
					addPixel('https://ib.adnxs.com/pxj?bidder=140&seg=381342&action=setuid("' + kuid + '")&bust=' + cacheBust);
				});
			}

			//Pangaea is a digital advertising alliance with The Guardian, CNN etc that we have signed up to.
			if (flags.get('kruxAppNexusPangaeaIntegration')) {
				frequencyCap('appnexus-pangaea', 2, function () {
					var kurl = 'https://beacon.krxd.net/usermatch.gif?adnxs_uid=$UID';
					addPixel('https://ib.adnxs.com/getuid?' + kurl);
				});
			}
		}

		//AdAdvisor is another Krux data partner with 3rd party data points
		if (flags.get('kruxAdAdvisorIntegration')) {
			frequencyCap('AdAdvisor-S2S', 2, function () {
				addPixel('https://adadvisor.net/adscores/g.js?sid=9212244187&_kdpid=2111c0af-fc3a-446f-ab07-63aa74fbde8e');
			});
		}
	});
};

},{"./../../../o-ads/main.js":88,"./../../../superstore/lib/superstore.js":137}],66:[function(require,module,exports){
'use strict'

// Load these things immediately
;
var initNow = function initNow(flags, oErrors, appInfo) {
	require('../src/analytics/o-tracking-wrapper').init(flags, oErrors, appInfo);
};

// Load these things after the document is ready
var initAfterEverythingElse = function initAfterEverythingElse(flags) {

	// ftNextLoaded is fired by next-js-setup
	window.addEventListener('ftNextLoaded', function () {
		require('./commercial/ads')(flags);
		require('./analytics/ijento')(flags);
		require('./analytics/sessioncam')(flags);
		require('./analytics/floodlight')(flags);
		require('./analytics/inspectlet')(flags);
		require('./analytics/sourcepoint')(flags);
	});
};

module.exports = {
	init: initNow,
	initAfterEverythingElse: initAfterEverythingElse
};

},{"../src/analytics/o-tracking-wrapper":61,"./analytics/floodlight":58,"./analytics/ijento":59,"./analytics/inspectlet":60,"./analytics/sessioncam":62,"./analytics/sourcepoint":63,"./commercial/ads":64}],67:[function(require,module,exports){
'use strict';

var Ads = window.oAds = require("./../o-ads/main.js");
var layout = require('./src/js/layout');
var utils = require('./src/js/utils');
var oAdsConfig = require('./src/js/oAdsConfig');
var jsonpFetch = require("./../n-jsonp/client/main.js");

var slotCount = undefined;
var slotsRendered = 0;
var containers = undefined;

function getTargetingPromise(appName) {
	var promise = Promise.resolve({});
	var uuid = undefined;
	var url = undefined;

	if (appName === 'article') {
		uuid = document.querySelector('[data-content-id]').getAttribute('data-content-id');

		var referrer = utils.getReferrer();
		url = 'https://next-ads-api.ft.com/v1/content/' + uuid;
		if (referrer) {
			url += '?referrer=' + encodeURIComponent(referrer.split(/[?#]/)[0]);
		}
	} else if (appName === 'stream-page') {
		uuid = document.querySelector('[data-concept-id]').getAttribute('data-concept-id');
		url = 'https://next-ads-api.ft.com/v1/concept/' + uuid;
	}

	if (uuid && url) {
		promise = jsonpFetch.default(url, { timeout: 2000 }).then(function (res) {
			return res.json();
		}).catch(function () {
			return {};
		});
	}

	return promise;
};

function init(flags) {
	slotsRendered = 0;
	var appName = utils.getAppName();
	if (flags && flags.get('ads') && appName) {
		if (layout.init(appName)) {
			var promiseOfTargeting = getTargetingPromise(appName);
			containers = [].slice.call(document.querySelectorAll('.o-ads'));
			promiseOfTargeting.then(function (targetingData) {

				var initObj = oAdsConfig(flags, targetingData);

				utils.log('dfp_targeting', initObj.dfp_targeting);
				document.addEventListener('oAds.complete', onAdsComplete);

				slotCount = containers.length;

				utils.log.info(slotCount + ' ad slots found on page');

				var ads = Ads.init(initObj);
				containers.forEach(ads.slots.initSlot.bind(ads.slots));
			});
			return promiseOfTargeting;
		}
	}
	if (!appName) {
		utils.log.warn('App not supported, create a layout in next-ads-component to enable ads.');
	}
}

function onAdsComplete(event) {
	/* istanbul ignore next */
	var performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

	var detail = event.detail;
	/* istanbul ignore else  */
	if (detail.type !== 'oop') {
		/* istanbul ignore else  */
		if (detail.slot.gpt && detail.slot.gpt.isEmpty === false) {
			utils.log.info('Ad loaded in slot', event);
			if (slotsRendered === 0 && performance && performance.mark) {
				performance.mark('firstAdLoaded');
			}
		} else if (detail.slot.gpt && detail.slot.gpt.isEmpty === true) {
			utils.log.warn('Failed to load ad, details below');
			utils.log(event);
		}
		slotsRendered++;
	}

	/* istanbul ignore else  */
	if (slotsRendered === slotCount) {
		utils.log('Ads component finished');
	}
}

module.exports.init = init;

},{"./../n-jsonp/client/main.js":57,"./../o-ads/main.js":88,"./src/js/layout":68,"./src/js/oAdsConfig":69,"./src/js/utils":72}],68:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var Sticky = require('./sticky');

module.exports.layouts = require('../layouts');

function addElementAttributes(element, data) {
	element.classList.add('o-ads');
	/* istanbul ignore else  */
	if (data['class']) {
		element.classList.add(data['class']);
	}

	Object.keys(data.attrs).forEach(function (item) {
		element.setAttribute('data-o-ads-' + item, data.attrs[item]);
	});
	return element;
}

function insertAdSlot(data) {
	var element = document.querySelector(data.selector);
	if (!element) {
		utils.log.error('Could not insert ad ' + data.htmlPosition + ' ' + data.selector + '.  Element not found');
		return;
	}

	if (data.insert) {
		var reference = element;
		element = addElementAttributes(document.createElement('div'), data);
		reference.insertAdjacentHTML(data.insert, element.outerHTML);
	} else {
		addElementAttributes(element, data);
	}

	/* istanbul ignore next  */
	if (data.attrs.sticky) {
		new Sticky(element, {
			stickUntil: document.querySelector('.o-header')
		}).init();
	}
}

function determineLayout(appName) {
	var name = utils.getLayoutName();
	var layout = undefined;
	if (module.exports.layouts[appName]) {
		if (module.exports.layouts[appName][name]) {
			layout = module.exports.layouts[appName][name];
			layout.name = name;
		} else {
			layout = module.exports.layouts[appName].default;
			layout.name = 'default';
		}

		return layout;
	}
	utils.log.error('No layout found for ' + appName + ' with ' + name);
	return false;
}

function init(appName) {
	var layout = determineLayout(appName);
	if (layout) {
		utils.log('ad layout', name, layout);
		layout.slots.forEach(insertAdSlot);
		return true;
	}
	return false;
}

module.exports.init = init;

},{"../layouts":82,"./sticky":71,"./utils":72}],69:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var metadata = require("./../../../ft-metadata/index.js");
var sandbox = require('./sandbox');
var extend = require("./../../../o-ads/main.js").utils.extend;
var pageType = utils.getAppName();

function getDemographicsData() {
	var userMetadata = metadata.user(true);
	var keysToSend = ['02', '05', '06', '07', '19', '40', '41', '42', '46', '51', 'slv'];
	function filterNullsAndKeys(key) {
		if (/^null$/i.test(userMetadata[key]) || ! ~keysToSend.indexOf(key)) {
			delete userMetadata[key];
		}
	}
	Object.keys(userMetadata).filter(filterNullsAndKeys);
	userMetadata['99'] = pageType + '-' + utils.getLayoutName();
	return userMetadata;
};

function getContextualData(targetingData, flags) {
	var isEnabled = flags.get('contextualAdTargeting');
	var categories = 1;
	var result = {};
	if (targetingData && targetingData.contextual && isEnabled) {
		if (targetingData.contextual.segments && targetingData.contextual.segments.length > 0) {
			result['ad'] = targetingData.contextual.segments;
		}
		if (targetingData.contextual.categories && targetingData.contextual.categories.length > 0 && categories > 0) {
			result['ca'] = targetingData.contextual.categories.splice(0, categories);
		}
	}
	return result;
}

function getGPTUnitName(targetingData) {
	var unitName = '5887/ft.com/';
	var dfpSite = undefined;
	var dfpZone = undefined;

	if (targetingData && targetingData.dfpSite) {
		dfpSite = targetingData.dfpSite;
		dfpZone = targetingData.dfpZone;
	} else {
		dfpSite = utils.getMetaData('dfp_site') || 'unclassified';
		dfpZone = utils.getMetaData('dfp_zone');
	}

	unitName += dfpSite;
	if (dfpSite === 'unclassified') {
		utils.log('warn', 'Ads: not dfp_site meta tag found. Using defaults');
	}

	if (dfpZone) {
		unitName += '/' + dfpZone;
	}

	// if we are in sandbox mode switch the dfp_site param
	if (sandbox.isActive()) {
		unitName = unitName.replace('5887/ft.com', '5887/sandbox.next.ft');
	}
	return unitName;
};

function convertSectionLabelsToKruxArray(sectionLabels) {
	var result = [];
	sectionLabels.forEach(function (sectionLabel) {
		result.push(sectionLabel.prefLabel);
	});
	return result;
}

module.exports = function (flags, targetingData) {
	var gptUnitName = getGPTUnitName(targetingData);
	var targeting = extend({
		pt: pageType.toLowerCase().substr(0, 3),
		nlayout: pageType + '-' + utils.getLayoutName() }, metadata.user(true), getContextualData(targetingData, flags));

	if (targetingData && targetingData.metadata && targetingData.metadata.taxonomy === 'organisations') {
		targeting.org = targetingData.metadata.prefLabel;
	}

	return {
		gpt: {
			unitName: gptUnitName
		},
		responsive: {
			extra: [1025, 0],
			large: [1000, 0],
			medium: [760, 0],
			small: [489, 0],
			'default': [0, 0]
		},
		formats: {
			Responsive: {
				sizes: [2, 2]
			}
		},
		chartbeat: flags.get('chartbeat') && {
			pageType: pageType,
			uid: '14181',
			domain: 'next.ft.com',
			loadsJS: true,
			demographics: getDemographicsData()
		},
		krux: flags.get('krux') && {
			id: 'KHUSeE3x',
			attributes: {
				user: metadata.user(),
				page: {
					unitName: gptUnitName,
					primarySection: targetingData.metadata && targetingData.metadata.primarySection ? convertSectionLabelsToKruxArray(targetingData.metadata.primarySection) : null,
					topics: targetingData.metadata && targetingData.metadata.topics ? convertSectionLabelsToKruxArray(targetingData.metadata.topics) : null,
					genre: targetingData.metadata && targetingData.metadata.genre ? convertSectionLabelsToKruxArray(targetingData.metadata.genre) : null,
					authors: targetingData.metadata && targetingData.metadata.authors ? convertSectionLabelsToKruxArray(targetingData.metadata.authors) : null,
					specialReports: targetingData.metadata && targetingData.metadata.specialReports ? convertSectionLabelsToKruxArray(targetingData.metadata.specialReports) : null
				}
			}
		},
		collapseEmpty: 'never',
		metadata: true,
		searchTerm: true,
		pageReferrer: true,
		timestamp: true,
		version: true,
		dfp_targeting: utils.keyValueString(targeting)
	};
};

},{"./../../../ft-metadata/index.js":2,"./../../../o-ads/main.js":88,"./sandbox":70,"./utils":72}],70:[function(require,module,exports){
'use strict';

function sandbox() {
	return location.hash.indexOf('adsandbox') > -1;
}

module.exports.isActive = sandbox;

},{}],71:[function(require,module,exports){
'use strict';

var debounce = require('./utils').debounce;

/*istanbul ignore next*/
function Sticky(el, opts) {
	this.el = el;
	this.opts = opts;
}

/*istanbul ignore next*/
Sticky.prototype.stick = function () {
	this.el.style.position = "fixed";
	this.el.style.top = '0px';
	this.sibling.style.marginTop = this.el.offsetHeight + 'px';
};
/*istanbul ignore next*/
Sticky.prototype.unstick = function () {

	this.el.style.position = 'absolute';
	this.el.style.top = this.stickyUntilPoint + 'px';
	this.sibling.style.marginTop = this.el.offsetHeight + 'px';
};
/*istanbul ignore next*/
Sticky.prototype.reset = function () {

	this.el.style.position = 'static';
	this.sibling.style.marginTop = '0px';
};
/*istanbul ignore next*/
Sticky.prototype.onScroll = function () {
	if (this.stickyUntilPoint > window.pageYOffset) {
		requestAnimationFrame(this.stick.bind(this));
	} else {
		requestAnimationFrame(this.unstick.bind(this));
	}
};
/*istanbul ignore next*/
Sticky.prototype.onResize = function () {
	if (this.onScrollListener && this.el.offsetHeight < 10) {
		this.unbindScroll();
	} else if (!this.onScrollListener && this.el.offsetHeight >= 10) {
		this.bindScroll();
	}
	this.stickyUntilPoint = this.opts.stickUntil.offsetTop + this.opts.stickUntil.offsetHeight - this.el.offsetHeight;
};
/*istanbul ignore next*/
Sticky.prototype.bindScroll = function () {
	this.onScrollListener = debounce(this.onScroll).bind(this);
	window.addEventListener('scroll', this.onScrollListener);
};
/*istanbul ignore next*/
Sticky.prototype.unbindScroll = function () {
	window.removeEventListener('scroll', this.onScrollListener);
	this.onScrollListener = null;
	this.reset();
};
/*istanbul ignore next*/
Sticky.prototype.init = function () {

	if (!this.el) {
		return;
	};

	this.sibling = this.el.nextElementSibling;
	this.stickyUntilPoint = this.opts.stickUntil.offsetTop + this.opts.stickUntil.offsetHeight - this.el.offsetHeight;
	this.el.style.zIndex = '23';

	window.addEventListener('resize', debounce(this.onResize).bind(this));

	this.bindScroll();

	if (window.pageYOffset > 0) {
		this.unstick();
	}
};

module.exports = Sticky;

},{"./utils":72}],72:[function(require,module,exports){
'use strict';

/*istanbul ignore next*/
function debounce(func, wait, immediate) {
	var timeout = undefined;
	return function () {
		var context = this;
		var args = arguments;
		var later = function later() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
};

function getAppName() {
	var element = document.querySelector('[data-next-app]');
	if (element) {
		return element.getAttribute('data-next-app');
	}
	return 'unknown';
}

function getLayoutName() {
	var element = document.querySelector('[data-ads-layout]');
	if (element) {
		return element.getAttribute('data-ads-layout');
	}
	return 'default';
}

function getMetaData(name) {
	var meta = document.querySelector('meta[name="' + name + '"]');
	if (meta) {
		return meta.getAttribute('content');
	}
	return false;
}

function keyValueString(obj) {
	return Object.keys(obj).map(function (key) {
		return key + '=' + obj[key];
	}).join(';');
}

function getReferrer() {
	return document.referrer;
}

function isEmpty(htmlNode) {
	return htmlNode.firstChild === null || htmlNode.firstChild.nodeType !== 1 || htmlNode.firstChild.style.display === 'none';
}

function log() {
	var type = undefined;
	var args = undefined;
	var argsIndex = undefined;
	if ('log warn error info'.indexOf(arguments[0]) === -1) {
		type = 'log';
		argsIndex = 0;
	} else {
		type = arguments[0];
		argsIndex = 1;
	}

	args = [].slice.call(arguments, argsIndex);

	if (!log.isOn() || !window.console || !window.console[type]) {
		return;
	}

	window.console[type].apply(window.console, args);
}

log.warn = function () {
	var args = ['warn'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.error = function () {
	var args = ['error'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.info = function () {
	var args = ['info'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.start = function () {
	if (!log.isOn() || !window.console || !window.console.groupCollapsed) {
		return;
	}

	window.console.groupCollapsed('next-ads-component');
};

log.end = function () {
	if (!log.isOn() || !window.console || !window.console.groupEnd) {
		return;
	}

	window.console.groupEnd();
};

log.isOn = function () {
	return location.search.indexOf('DEBUG=ADS') > -1;
};

module.exports = {
	debounce: debounce,
	getAppName: getAppName,
	getLayoutName: getLayoutName,
	getMetaData: getMetaData,
	getReferrer: getReferrer,
	keyValueString: keyValueString,
	isEmpty: isEmpty,
	log: log
};

},{}],73:[function(require,module,exports){
'use strict';

module.exports = {
	pageType: 'art',
	slots: [{
		'selector': '.article-header-ad-placeholder',
		'attrs': {
			'name': 'leaderboard',
			'targeting': 'pos=banlb;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'Leaderboard,SuperLeaderboard,Responsive',
			'formats-extra': 'Leaderboard,SuperLeaderboard,Responsive',
			'center': true,
			'out-of-page': true
		}
	}, {
		'selector': '.sidebar-ad-placeholder',
		'attrs': {
			'name': 'halfpage',
			'targeting': 'pos=hlfmpu;',
			'center': true,
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': 'MediumRectangle,HalfPage,Responsive',
			'formats-extra': 'MediumRectangle,HalfPage,Responsive'
		}
	}, {
		'insert': 'beforebegin',
		'selector': '.article__body > p:nth-of-type(n + 3) + p',
		'class': 'advertising__article-text',
		'attrs': {
			'name': 'mpu',
			'center': true,
			'label': true,
			'targeting': 'pos=mpu;',
			'formats-default': 'MediumRectangle,Responsive',
			'formats-small': 'MediumRectangle,Responsive',
			'formats-medium': 'MediumRectangle,Responsive',
			'formats-large': false,
			'formats-extra': false
		}
	}]
};

},{}],74:[function(require,module,exports){
'use strict';

module.exports = {
	pageType: 'art',
	slots: [{
		'selector': '.article-header-ad-placeholder',
		'attrs': {
			'name': 'leaderboard',
			'targeting': 'pos=banlb;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'Leaderboard,SuperLeaderboard,Responsive',
			'formats-extra': 'Leaderboard,SuperLeaderboard,Responsive',
			'center': true,
			'out-of-page': true
		}
	}, {
		'selector': '.sidebar-ad-placeholder',
		'attrs': {
			'name': 'halfpage',
			'targeting': 'pos=hlfmpu;',
			'center': true,
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': 'MediumRectangle,HalfPage,Responsive',
			'formats-extra': 'MediumRectangle,HalfPage,Responsive'
		}
	}, {
		'insert': 'beforebegin',
		'selector': '.article__body > p:nth-of-type(n + 3) + p',
		'class': 'advertising__article-text',
		'attrs': {
			'name': 'mpu',
			'center': true,
			'label': true,
			'targeting': 'pos=mpu;',
			'formats-default': 'MediumRectangle,Responsive',
			'formats-small': 'MediumRectangle,Responsive',
			'formats-medium': 'MediumRectangle,Responsive',
			'formats-large': false,
			'formats-extra': false
		}
	}]
};

},{}],75:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': 'Billboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.ad-placeholder--below-header',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-top-stories',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],76:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': 'Billboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Responsive',
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Responsive',
			'formats-extra': 'Billboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],77:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'leaderboard',
			'targeting': 'pos=banlb;',
			'formats-small': false,
			'formats-medium': false,
			'formats-large': 'Leaderboard,SuperLeaderboard',
			'center': true,
			'lazy-load': true
		}
	}, {
		'selector': '.ad-placeholder--fast-ft',
		'class': 'advertising__sidebar',
		'attrs': {
			'name': 'MPU1',
			'targeting': 'pos=mpu;',
			'formats-small': false,
			'formats-medium': false,
			'formats-large': 'MediumRectangle',
			'center': true,
			'lazy-load': true
		}
	}]
};

},{}],78:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true,
			'sticky': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive',
			'formats-small': 'Responsive',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.ad-placeholder--exit',
		'attrs': {
			'name': 'exit',
			'targeting': 'pos=exit;',
			'formats-default': 'Responsive',
			'formats-small': 'Responsive',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],79:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true,
			'sticky': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.ad-placeholder--exit',
		'attrs': {
			'name': 'exit',
			'targeting': 'pos=exit;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],80:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.ad-placeholder--exit',
		'attrs': {
			'name': 'exit',
			'targeting': 'pos=exit;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'SuperLeaderboard,Leaderboard,Responsive',
			'formats-extra': 'Billboard,SuperLeaderboard,Leaderboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],81:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'ind',
	'slots': [{
		'selector': '.header-ad-placeholder__top',
		'attrs': {
			'name': 'entry',
			'targeting': 'pos=entry;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'Leaderboard,Responsive',
			'formats-extra': 'SuperLeaderboard,Responsive',
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-1 .ad-placeholder',
		'attrs': {
			'name': 'entry-below-header',
			'targeting': 'pos=entry;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': false,
			'formats-large': false,
			'formats-extra': false,
			'lazy-load': true
		}
	}, {
		'selector': '.section--mid-page-advert-2 .ad-placeholder',
		'attrs': {
			'name': 'midpage1',
			'targeting': 'pos=midpage1;',
			'formats-default': 'Responsive,MediumRectangle',
			'formats-small': 'Responsive,MediumRectangle',
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'Leaderboard,Responsive',
			'formats-extra': 'SuperLeaderboard,Responsive',
			'lazy-load': true
		}
	}]
};

},{}],82:[function(require,module,exports){
'use strict';

module.exports = {
	'front-page': {
		default: require('./front-page/default'),
		billboards: require('./front-page/billboards'),
		highimpact: require('./front-page/highimpact'),
		superleaders: require('./front-page/superleaders'),
		belowheader: require('./front-page/belowheader'),
		sponsorship: require('./front-page/sponsorship'),
		multiplesizes: require('./front-page/multiplesizes')
	},
	'article': {
		default: require('./article/default'),
		prototype: require('./article/prototype')
	},
	'stream-page': {
		default: require('./stream-page/default')
	}
};

},{"./article/default":73,"./article/prototype":74,"./front-page/belowheader":75,"./front-page/billboards":76,"./front-page/default":77,"./front-page/highimpact":78,"./front-page/multiplesizes":79,"./front-page/sponsorship":80,"./front-page/superleaders":81,"./stream-page/default":83}],83:[function(require,module,exports){
'use strict';

module.exports = {
	'pageType': 'str',
	'slots': [{
		'selector': '.stream-page-header-ad-placeholder',
		'attrs': {
			'name': 'leaderboard',
			'targeting': 'pos=banlb;',
			'formats-default': false,
			'formats-small': false,
			'formats-medium': 'Leaderboard,Responsive',
			'formats-large': 'Leaderboard,SuperLeaderboard,Responsive',
			'formats-extra': 'Leaderboard,SuperLeaderboard,Responsive',
			'center': true,
			'out-of-page': true,
			'lazy-load': true
		}
	}, {
		'selector': '.sidebar-ad-placeholder',
		'attrs': {
			'name': 'mpu',
			'targeting': 'pos=mpu;',
			'formats-default': false,
			'formats-small': 'MediumRectangle',
			'formats-medium': 'MediumRectangle',
			'formats-large': 'MediumRectangle',
			'formats-extra': 'MediumRectangle',
			'lazy-load': true
		}
	}]
};

},{}],84:[function(require,module,exports){
'use strict';

var Flags = require('../shared/models/flags');

if (!window.nextFeatureFlags) {
	throw 'Cannot initialise client side feature flags without window.nextFeatureFlags object';
}

var flags = undefined;

function init() {
	if (!flags) {
		flags = new Flags({
			flags: window.nextFeatureFlags,
			// no need to override or expire on client side as cookies/headers already handled on the server
			hasSteadyState: true
		});
	}

	return Promise.resolve(flags);
}

module.exports = {
	init: init,
	parseOverrides: require('../shared/toggler').parseOverrides
};

},{"../shared/models/flags":86,"../shared/toggler":87}],85:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Flag = (function () {
	function Flag(flag, options) {
		_classCallCheck(this, Flag);

		options = options || {};
		this.name = flag.name;
		this.description = flag.description;
		this.safeState = flag.safeState;
		this.hasSteadyState = options.hasSteadyState;
		this.state = flag.state;
		if (!this.hasSteadyState) {
			this.expiry = new Date(flag.expiry);
		}
	}

	_createClass(Flag, [{
		key: 'activeState',
		get: function get() {
			return this.hasSteadyState ? this.state : this.isPastSellByDate ? this.safeState : this.state;
		}
	}, {
		key: 'isPastSellByDate',
		get: function get() {
			return Date.now() - this.expiry > 0;
		}
	}]);

	return Flag;
})();

;

module.exports = Flag;

},{}],86:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Flag = require('./flag');

var Flags = (function () {
	function Flags(opts) {
		_classCallCheck(this, Flags);

		opts = opts || {};
		this.opts = opts;
		this.eager = opts.eager || false;
		if (opts.flags) {
			this.set(opts.flags);
		} else {
			this.flags = {};
		}
	}

	_createClass(Flags, [{
		key: 'get',
		value: function get(flagname) {
			if (flagname) {
				var flag = this.flags[flagname];
				return flag ? flag.activeState : false;
			}
			return this.flags;
		}

		// Note[P'I'W] I think that getAll is a better name for this method, although I see why
		// Let's just have both and have a better API

	}, {
		key: 'getHash',
		value: function getHash() {
			console.warn('`getHash` deprecated, use `getAll`');
			return this.getAll();
		}
	}, {
		key: 'getAll',
		value: function getAll() {
			var allFlags = {};
			Object.keys(this.flags).forEach((function (key) {
				allFlags[key] = this.flags[key].activeState;
			}).bind(this));
			return allFlags;
		}
	}, {
		key: 'getRaw',
		value: function getRaw() {
			return this.rawFlags;
		}
	}, {
		key: 'set',
		value: function set(data) {
			var _this = this;

			var flags = {};

			if (!data || data.length === 0) {
				throw 'No data passed to initialise flags';
			}
			data.forEach(function (flag) {

				flag = new Flag(flag, {
					hasSteadyState: _this.opts.hasSteadyState
				});
				flags[flag.name] = flag;
			});

			this.flags = flags;
			this.rawFlags = data;
			return this;
		}
	}, {
		key: 'clear',
		value: function clear() {
			this.flags = null;
		}
	}]);

	return Flags;
})();

module.exports = Flags;

},{"./flag":85}],87:[function(require,module,exports){
'use strict'

// Cookie looks like this: next-flags=ads:on,tearsheets:off
;
var regex = new RegExp('(?:^|;)\\s?next-flags=(.*?)(?:;|$)', 'i');

function parseOverrides(overrides) {
	if (!overrides) {
		return [];
	}
	return decodeURIComponent(overrides).split(',').map(function (flag) {
		flag = flag.split(':');
		return {
			name: flag[0],
			state: flag[1]
		};
	});
}

module.exports = {
	readFromCookie: function readFromCookie(cookie) {
		return cookie ? (cookie.match(regex) || [null, ''])[1] : '';
	},
	override: function override(target, overrides) {
		parseOverrides(overrides).forEach(function (flag) {
			if (flag.state === 'on') {
				target[flag.name] = true;
			} else if (flag.state === 'off' || flag.state === 'control') {
				target[flag.name] = false;
			} else {
				target[flag.name] = flag.state;
			}
		});
		return target;
	},
	parseOverrides: parseOverrides
};

},{}],88:[function(require,module,exports){
/**
 * O-ADS - the origami advertising library
 * @author Advertising Technology origami.advertising.technology@ft.com
 *
 */
'use strict'

/**
 * Represents an instance of the o-ads on the page.
 * All sub modules are available from the prototype
 * @constructor
 */
;
function Ads() {}

// bung all our modules on the protoype
Ads.prototype.config = require('./src/js/config');
Ads.prototype.slots = require('./src/js/slots');
Ads.prototype.gpt = require('./src/js/ad-servers/gpt');
Ads.prototype.krux = require('./src/js/data-providers/krux');
Ads.prototype.cb = require('./src/js/data-providers/chartbeat');
Ads.prototype.rubicon = require('./src/js/data-providers/rubicon');
Ads.prototype.admantx = require('./src/js/data-providers/admantx');
Ads.prototype.targeting = require('./src/js/targeting');
Ads.prototype.metadata = require('./src/js/metadata');
Ads.prototype.version = require('./src/js/version');
Ads.prototype.buildURLForVideo = require('./src/js/video');
var utils = Ads.prototype.utils = require('./src/js/utils');

/**
* Initialises the ads library and all sub modules
* @param config {object} a JSON object containing configuration for the current page
*/

Ads.prototype.init = function (config) {
	this.config.init();
	this.config(config);
	this.slots.init();
	this.gpt.init();
	this.krux.init();
	this.cb.init();
	this.rubicon.init();
	this.admantx.init();
	this.utils.on('debug', this.debug.bind(this));
	return this;
};

var ads = new Ads();
var initAll = function initAll() {
	var metas = utils.arrayLikeToArray(document.getElementsByTagName('meta'));
	var stop = metas.filter(function (meta) {
		return meta.name === 'o-ads-stop';
	});
	/* istanbul ignore else  */
	if (!stop.length) {
		ads.init();
		var slots = utils.arrayLikeToArray(document.querySelectorAll('.o-ads, [data-o-ads-name]'));
		slots.forEach(ads.slots.initSlot.bind(ads.slots));
	}

	document.documentElement.removeEventListener('o.DOMContentLoaded', initAll);
};

Ads.prototype.debug = function () {
	var remove = true;
	if (localStorage.getItem('oAds')) {
		remove = false;
	} else {
		localStorage.setItem('oAds', true);
	}
	this.admantx.debug();
	this.cb.debug();
	this.gpt.debug();
	this.krux.debug();
	this.slots.debug();
	this.targeting.debug();
	this.buildURLForVideo.debug();

	if (remove) {
		localStorage.removeItem('oAds');
	}
};

document.documentElement.addEventListener('o.DOMContentLoaded', initAll);

module.exports = ads;

},{"./src/js/ad-servers/gpt":89,"./src/js/config":90,"./src/js/data-providers/admantx":91,"./src/js/data-providers/chartbeat":92,"./src/js/data-providers/krux":93,"./src/js/data-providers/rubicon":94,"./src/js/metadata":95,"./src/js/slots":97,"./src/js/targeting":98,"./src/js/utils":101,"./src/js/version":107,"./src/js/video":108}],89:[function(require,module,exports){
/*globals googletag: true */

/**
* @fileOverview
* ad server modukes for o-ads implementing Google publisher tags ad requests.
*
* @author Robin Marr, robin.marr@ft.com
*/

'use strict';

var config = require('../config');
var utils = require('../utils');
var targeting = require('../targeting');
var breakpoints = false;
/*
//###########################
// Initialisation handlers ##
//###########################
*/

/*
* Initialise Google publisher tags functionality
*/
function init() {
	var gptConfig = config('gpt') || {};
	breakpoints = config('responsive');
	initGoogleTag();

	utils.on('ready', onReady.bind(null, slotMethods));
	utils.on('render', onRender);
	utils.on('refresh', onRefresh);
	utils.on('resize', onResize);
	googletag.cmd.push(setup.bind(null, gptConfig));
}

/*
* initalise the googletag global namespace and add the google publish tags library to the page
*/
function initGoogleTag() {
	if (!window.googletag) {
		// set up a place holder for the gpt code downloaded from google
		window.googletag = {};

		// this is a command queue used by GPT any methods added to it will be
		// executed when GPT code is available, if GPT is already available they
		// will be executed immediately
		window.googletag.cmd = [];
	}

	utils.attach('//www.googletagservices.com/tag/js/gpt.js', true, null, function (err) {
		utils.broadcast('adServerLoadError', err);
	});
}

/*
//#################################
// Global configuration handlers ##
//#################################
*/

/*
* Configure the GPT library for the current page
* this method is pushed onto the googletag command queue and run
* when the library is available
*/
function setup(gptConfig) {
	googletag.pubads().addEventListener('slotRenderEnded', onRenderEnded);
	enableVideo(gptConfig);
	enableCompanions(gptConfig);
	setRenderingMode(gptConfig);
	setPageTargeting(targeting.get());
	setPageCollapseEmpty(gptConfig);
	googletag.enableServices();
	return true;
}

/*
* set the gpt rendering mode to either sync or async
* default is async
*/

function setRenderingMode(gptConfig) {
	var rendering = gptConfig.rendering;
	if (rendering === 'sync') {
		googletag.pubads().enableSyncRendering();
	} else if (rendering === 'sra') {
		googletag.pubads().enableSingleRequest();
	} else {
		googletag.pubads().enableAsyncRendering();
	}
}

/**
* Adds page targeting to GPT ad calls
* @name setPageTargeting
* @memberof GPT
* @lends GPT
*/
function setPageTargeting(targeting) {
	function setTargeting(key, value) {
		googletag.pubads().setTargeting(key, value);
	}

	if (utils.isPlainObject(targeting)) {
		Object.keys(targeting).forEach(function (param) {
			googletag.cmd.push(setTargeting.bind(null, param, targeting[param]));
		});
	} else {
		utils.log.warn('invalid targeting object passed', targeting);
	}

	return targeting;
}

/**
* Sets behaviour of empty slots can be 'after', 'before' or 'never'
* * after collapse slots that return an empty ad
* * before collapses all slots and only displays them on
* true is synonymous with before
* false is synonymous with never
*/
function setPageCollapseEmpty(gptConfig) {
	var mode = gptConfig.collapseEmpty;

	if (mode === 'before' || mode === true) {
		googletag.pubads().collapseEmptyDivs(true, true);
	} else if (mode === 'never' || mode === false) {
		googletag.pubads().collapseEmptyDivs(false);
	} else {
		//default is after
		googletag.pubads().collapseEmptyDivs(true);
	}
}

/**
* When companions are enabled we delay the rendering of ad slots until
* either a master is returned or all slots are returned without a master
*/
function enableCompanions(gptConfig) {
	if (gptConfig.companions) {
		googletag.pubads().disableInitialLoad();
		googletag.companionAds().setRefreshUnfilledSlots(true);
	}
}

/**
* Enables video ads and attaches the required additional script
* @name enableVideo
* @memberof GPT
* @lends GPT
*/
function enableVideo(gptConfig) {
	if (gptConfig.video) {
		var url = '//s0.2mdn.net/instream/html5/gpt_proxy.js';
		/* istanbul ignore else  */
		if (!utils.isScriptAlreadyLoaded(url)) {
			utils.attach(url, true);
		}

		googletag.pubads().enableVideoAds();
	}
}

/*
//##################
// Event handlers ##
//##################
*/

/*
* Event handler for when a slot is ready for an ad to rendered
*/
function onReady(slotMethods, event) {
	var slot = event.detail.slot;
	/* istanbul ignore else  */
	if (slot.server === 'gpt') {
		slot.gpt = {};

		// extend the slot with gpt methods
		utils.extend(slot, slotMethods);

		// setup the gpt configuration the ad
		googletag.cmd.push((function (slot) {
			slot.defineSlot().addServices().setCollapseEmpty().setTargeting().setURL();

			if (slot.outOfPage) {
				slot.defineOutOfPage();
			}

			if (!slot.defer && slot.hasValidSize()) {
				slot.display();
			}
		}).bind(null, slot));
	}
}
/*
* Render is called when a slot is not rendered when the ready event fires
*/
function onRender(event) {
	var slot = event.detail.slot;
	if (utils.isFunction(slot.display)) {
		slot.display();
	} else {
		slot.defer = false;
	}
}

/*
* refresh is called when a slot requests the ad be flipped
*/
function onRefresh(event) {
	window.googletag.cmd.push((function (event) {
		var targeting = event.detail.targeting;
		if (utils.isPlainObject(targeting)) {
			Object.keys(targeting).forEach(function (name) {
				event.detail.slot.gpt.slot.setTargeting(name, targeting[name]);
			});
		}
		googletag.pubads().refresh([event.detail.slot.gpt.slot]);
	}).bind(this, event));
	return this;
}

function onResize(event) {
	var iframe = event.detail.slot.gpt.iframe;
	var size = event.detail.size;
	iframe.width = size[0];
	iframe.height = size[1];
}

/*
* function passed to the gpt library that is run when an ad completes rendering
*/
function onRenderEnded(event) {
	var detail;
	var data = {
		gpt: {}
	};

	var gptSlotId = event.slot.getSlotId();
	var domId = gptSlotId.getDomId().split('-');
	var iframeId = 'google_ads_iframe_' + gptSlotId.getId();
	data.type = domId.pop();
	data.name = domId.join('-');

	if (data.type === 'gpt') {
		detail = data.gpt;
	} else {
		data.gpt.oop = {};
		detail = data.gpt.oop;
	}

	detail.isEmpty = event.isEmpty;
	detail.size = event.size;
	detail.creativeId = event.creativeId;
	detail.lineItemId = event.lineItemId;
	detail.serviceName = event.serviceName;
	detail.iframe = document.getElementById(iframeId);

	utils.broadcast('rendered', data);
}

/*
//################
// Slot methods ##
//################
* Set of methods extended on to the slot constructor for GPT served slots
*/
var slotMethods = {
	/**
 * define a GPT slot
 */
	defineSlot: function defineSlot() {
		window.googletag.cmd.push((function () {
			this.gpt.id = this.name + '-gpt';
			this.inner.setAttribute('id', this.gpt.id);
			this.setUnitName();

			if (breakpoints && utils.isObject(this.sizes)) {
				this.initResponsive();
				this.gpt.slot = googletag.defineSlot(this.gpt.unitName, [0, 0], this.gpt.id).defineSizeMapping(this.gpt.sizes);
			} else {
				this.gpt.slot = googletag.defineSlot(this.gpt.unitName, this.sizes, this.gpt.id);
			}
		}).bind(this));
		return this;
	},
	/**
 * creates a container for an out of page ad and then makes the ad request
 */
	defineOutOfPage: function defineOutOfPage() {
		window.googletag.cmd.push((function () {
			var oop = this.gpt.oop = {};
			oop.id = this.name + '-oop';
			this.addContainer(this.container, { id: oop.id });

			oop.slot = googletag.defineOutOfPageSlot(this.gpt.unitName, oop.id).addService(googletag.pubads());

			this.setTargeting(oop.slot);
			this.setURL(oop.slot);
			googletag.display(oop.id);
		}).bind(this));
		return this;
	},
	clearSlot: function clearSlot(gptSlot) {
		if (window.googletag.pubadsReady && window.googletag.pubads) {
			gptSlot = gptSlot || this.gpt.slot;
			return googletag.pubads().clear([gptSlot]);
		} else {
			return false;
		}
	},
	initResponsive: function initResponsive() {
		window.googletag.cmd.push((function () {
			utils.on('breakpoint', function (event) {
				var slot = event.detail.slot;
				var screensize = event.detail.screensize;

				if (slot.hasValidSize(screensize) && !slot.responsiveCreative) {
					/* istanbul ignore else  */
					if (slot.gpt.iframe) {
						slot.fire('refresh');
					} else if (!this.defer) {
						slot.display();
					}
				}
			}, this.container);

			var mapping = googletag.sizeMapping();
			Object.keys(breakpoints).forEach((function (breakpoint) {
				if (this.sizes[breakpoint]) {
					mapping.addSize(breakpoints[breakpoint], this.sizes[breakpoint]);
				}
			}).bind(this));

			this.gpt.sizes = mapping.build();
		}).bind(this));
		return this;
	},
	/*
 *	Tell gpt to request an ad
 */
	display: function display() {
		window.googletag.cmd.push((function () {
			googletag.display(this.gpt.id);
		}).bind(this));
		return this;
	},
	/**
 * Set the DFP unit name for the slot.
 */
	setUnitName: function setUnitName() {
		window.googletag.cmd.push((function () {
			var unitName;
			var gpt = config('gpt') || {};
			var attr = this.container.getAttribute('data-o-ads-gpt-unit-name');

			if (utils.isNonEmptyString(attr)) {
				unitName = attr;
			} else if (utils.isNonEmptyString(gpt.unitName)) {
				unitName = gpt.unitName;
			} else {
				var network = gpt.network;
				var site = gpt.site;
				var zone = gpt.zone;
				unitName = '/' + network;
				unitName += utils.isNonEmptyString(site) ? '/' + site : '';
				unitName += utils.isNonEmptyString(zone) ? '/' + zone : '';
			}
			this.gpt.unitName = unitName;
		}).bind(this));
		return this;
	},
	/**
 * Add the slot to the pub ads service and add a companion service if configured
 */
	addServices: function addServices(gptSlot) {
		window.googletag.cmd.push((function (gptSlot) {
			var gpt = config('gpt') || {};
			gptSlot = gptSlot || this.gpt.slot;
			gptSlot.addService(googletag.pubads());
			if (gpt.companions && this.companion !== false) {
				gptSlot.addService(googletag.companionAds());
			}
		}).bind(this, gptSlot));
		return this;
	},

	/**
 * Sets the GPT collapse empty mode for a given slot
 * values can be 'after', 'before', 'never'
 * after as in after ads have rendered is the default
 * true is synonymous with before
 * false is synonymous with never
 */
	setCollapseEmpty: function setCollapseEmpty() {
		window.googletag.cmd.push((function () {
			var mode = this.collapseEmpty || config('collapseEmpty');

			if (mode === true || mode === 'after') {
				this.gpt.slot.setCollapseEmptyDiv(true);
			} else if (mode === 'before') {
				this.gpt.slot.setCollapseEmptyDiv(true, true);
			} else if (mode === false || mode === 'never') {
				this.gpt.slot.setCollapseEmptyDiv(false);
			}
		}).bind(this));
		return this;
	},
	submitGptImpression: function submitGptImpression() {
		if (this.gpt.oop && this.gpt.oop.iframe) {
			var getImpressionURL = function getImpressionURL(iframe) {
				var trackingUrlElement = iframe.contentWindow.document.querySelector('[data-o-ads-impression-url]');
				if (trackingUrlElement) {
					return trackingUrlElement.dataset.oAdsImpressionUrl;
				} else {
					utils.log.warn('Impression URL not found, this is set via a creative template.');
					return false;
				}
			};

			;
			var impressionURL = getImpressionURL(this.gpt.oop.iframe);
			/* istanbul ignore else  */
			if (impressionURL) {
				utils.createCORSRequest(impressionURL, 'GET', function () {
					utils.log.info('Impression Url requested');
				}, function () {
					utils.log.info('CORS request to submit an impression failed');
				});
			}
		} else {
			utils.log.warn('Attempting to call submitImpression on a non-oop slot');
		}
	},
	/**
 * Sets page url to be sent to google
 * prevents later url changes via javascript from breaking the ads
 */
	setURL: function setURL(gptSlot) {
		window.googletag.cmd.push((function () {
			gptSlot = gptSlot || this.gpt.slot;
			var canonical = config('canonical');
			gptSlot.set('page_url', canonical ? canonical : utils.getLocation());
		}).bind(this));
		return this;
	},

	/**
 * Adds key values from a given object to the slot targeting
 */
	setTargeting: function setTargeting(gptSlot) {
		window.googletag.cmd.push((function () {
			gptSlot = gptSlot || this.gpt.slot;
			/* istanbul ignore else  */
			if (utils.isPlainObject(this.targeting)) {
				Object.keys(this.targeting).forEach((function (param) {
					gptSlot.setTargeting(param, this.targeting[param]);
				}).bind(this));
			}
		}).bind(this));
		return this;
	}
};

/*
//####################
// External methods ##
//####################
*/

/**
* The correlator is a random number added to ad calls.
* It is used by the ad server to determine which impressions where served to the same page
* Updating is used to tell the ad server to treat subsequent ad calls as being on a new page
*/
function updateCorrelator() {
	googletag.cmd.push(function () {
		googletag.pubads().updateCorrelator();
	});
}

module.exports.init = init;
module.exports.updateCorrelator = updateCorrelator;
module.exports.updatePageTargeting = function (override) {
	if (window.googletag) {
		var params = utils.isPlainObject(override) ? override : targeting.get();
		setPageTargeting(params);
	} else {
		utils.log.warn('Attempting to set page targeting before the GPT library has initialized');
	}
};

module.exports.debug = function () {
	var log = utils.log;
	var conf = config('gpt');
	if (!conf) {
		return;
	}

	log.start('gpt');
	log.attributeTable(conf);
	log.end();
};

},{"../config":90,"../targeting":98,"../utils":101}],90:[function(require,module,exports){
//TODO remove all ft.com specific stuff so we can remove this as a global
// currently all FT specific stuff is wrapped in an if window.FT

/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@ft.com
 */

/**
 * The FT.ads.config object holds the confiuration properties for an FT.ads.gpt instance.
 * There are four tiers of configuration; cookie level config, default config (set within the constructor), metatag config and global (env) config.
 * Global config, (set in the page FT.env ojbect) takes priority over meta followed by default config with cookie config having the least priority.
 * The FT.ads.config() function acts as an accessor method for the config; allowing getting and setting of configuration values.
 * Calling config() with no parameters returns the entire configuration object.
 * Calling config passing a valid property key will envoke the 'getter' and return the value for that property key.
 * Calling config passing a valid property key and a value will envoke the setter and set the value of the key to the new value.
 * Calling config passing an object of keys and values will envoke a setter that extends the store with the object provided.
 * @name config
 * @memberof FT.ads
 * @function
*/
'use strict';

var utils = require('./utils');
/**
* Default configuration set in the constructor.
*/
var defaults = {
	formats: {
		MediumRectangle: { sizes: [300, 250] },
		Rectangle: { sizes: [180, 50] },
		WideSkyscraper: { sizes: [160, 600] },
		Leaderboard: { sizes: [728, 90] },
		SuperLeaderboard: { sizes: [[970, 90], [970, 66]] },
		HalfPage: { sizes: [300, 600] },
		Billboard: { sizes: [970, 250] },
		Portrait: { sizes: [300, 1050] },
		AdhesionBanner: { sizes: [320, 50] },
		MicroBar: { sizes: [88, 31] },
		Button2: { sizes: [120, 60] }
	},
	flags: {
		refresh: true,
		sticky: true,
		inview: true
	}
};

/**
* @private
* @function
* fetchMetaConfig pulls out metatag key value pairs into an object returns the object
*/
function fetchMetaConfig() {
	var meta;
	var results = {};
	var metas = document.getElementsByTagName('meta');
	for (var i = 0; i < metas.length; i++) {
		meta = metas[i];
		if (meta.name) {
			if (meta.getAttribute('data-contenttype') === 'json') {
				results[meta.name] = window.JSON ? JSON.parse(meta.content) : 'UNSUPPORTED';
			} else {
				results[meta.name] = meta.content;
			}
		}
	}

	return results;
}

function fetchDeclaritiveConfig() {
	var script;
	var scripts = document.querySelectorAll('script[data-o-ads-config]');
	var results = {};
	for (var i = 0; i < scripts.length; i++) {
		script = scripts[i];
		results = window.JSON ? utils.extend(results, JSON.parse(script.innerHTML)) : 'UNSUPPORTED';
	}

	return results;
}

/**
* @private
* @function
* fetchCanonicalURL Grabs the canonical URL from the page meta if it exists.
*/
function fetchCanonicalURL() {
	var canonical;
	var canonicalTag = document.querySelector('link[rel="canonical"]');
	if (canonicalTag) {
		canonical = canonicalTag.href;
	}

	return { canonical: canonical };
}

/**
* Defines a store for configuration information and returns a getter/setter method for access.
* @class
* @constructor
*/
function Config() {
	this.store = {};
}

Config.prototype.access = function (k, v) {
	var result;
	if (utils.isPlainObject(k)) {
		utils.extend(true, this.store, k);
		result = this.store;
	} else if (typeof v === 'undefined') {
		if (typeof k === 'undefined') {
			result = this.store;
		} else {
			result = this.store[k];
		}
	} else {
		this.store[k] = v;
		result = v;
	}

	return result;
};

Config.prototype.clear = function (key) {
	if (key) {
		delete this.store[key];
	} else {
		this.store = {};
	}
};

Config.prototype.init = function () {
	this.store = utils.extend(true, {}, defaults, fetchMetaConfig(), fetchCanonicalURL(), fetchDeclaritiveConfig());
	return this.store;
};

var config = new Config();
module.exports = config.access.bind(config);
module.exports.init = config.init.bind(config);
module.exports.clear = config.clear.bind(config);

},{"./utils":101}],91:[function(require,module,exports){
/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@com
 */

/**
 * ads.admantx provides admantx contextual data target information
 * @name targeting
 * @memberof ads
 */

'use strict';

var utils = require('../utils');
var config = require('../config');
var targeting = require('../targeting');

/**
 * The Admantx class defines an ads.admantx instance
 * @class
 * @constructor
*/
function Admantx() {}

/**
 * initialise Admantx functionality
 * calls Admantx api for targeting information
 * @name init
 * @memberof Admantx
 * @lends Admantx
*/

Admantx.prototype.init = function () {
	this.config = config('admantx') || {};
	if (this.config.id) {
		this.collections = this.config.collections || { admants: true };
		this.api = this.config.url || 'http://usasync01.admantx.com/admantx/service?request=';
		this.makeAPIRequest();
	}
};

Admantx.prototype.makeAPIRequest = function () {
	var requestData = {
		"key": this.config.id,
		"method": "descriptor",
		"mode": "async",
		"decorator": "template.ft",
		"filter": ["default"],
		"type": "URL",
		"body": encodeURIComponent(utils.getLocation())
	};
	var url = this.api + encodeURIComponent(JSON.stringify(requestData));
	this.xhr = utils.createCORSRequest(url, 'GET', this.resolve.bind(this), this.resolve.bind(this));
};

Admantx.prototype.processCollection = function (collection, max) {
	var names = [];
	var i = 0;
	var j = utils.isNumeric(max) ? Math.min(max, collection.length) : collection.length;
	for (; i < j; i++) {
		names.push(collection[i].name || collection[i]);
	}

	return names;
};

Admantx.prototype.resolve = function (response) {
	var collection;
	var collections = this.collections;
	var shortName;
	var targetingObj = {};
	/* istanbul ignore else  */
	if (utils.isString(response)) {
		try {
			response = JSON.parse(response);
		} catch (e) {
			/* istanbul ignore next  */
			// if the response is not valid JSON;
			response = false;
		}
	}

	//parse required targetting data from the response
	/* istanbul ignore else  */
	if (response) {
		for (collection in collections) {
			/* istanbul ignore else  */
			if (collections.hasOwnProperty(collection) && collections[collection] && response[collection]) {
				shortName = collection.substr(0, 2);
				targetingObj[shortName] = this.processCollection(response[collection], collections[collection]);
			}
		}

		targeting.add(targetingObj);
	}
};

Admantx.prototype.debug = function () {
	var log = utils.log;

	if (!this.config) {
		return;
	}

	log.start('Admantx');
	log('%c id:', 'font-weight: bold', this.config.id);
	log('%c api:', 'font-weight: bold', this.api);

	if (this.config.collections) {
		log.start('Collections');
		log('%c admants:', 'font-weight: bold', this.config.collections.admants);
		log('%c categories:', 'font-weight: bold', this.config.collections.categories);
		log.end();
	}

	if (this.xhr && this.xhr.response) {
		log.start('Response');
		log.start('Admants');
		log.attributeTable(this.xhr.response.admants, ['value']);
		log.end();
		log.start('Categories');
		log.attributeTable(this.xhr.response.categories, ['value']);
		log.end();
		log.end();
	}
	log.end();
};

module.exports = new Admantx();

},{"../config":90,"../targeting":98,"../utils":101}],92:[function(require,module,exports){
/**
* @fileOverview
* Third party library for use with google publisher tags.
*
* @author Robin Marr, robin.marr@ft.com
*/
/**
* FT.ads.chartbeat provides chartbest integration for the FT advertising library
* @name targeting
* @memberof FT.ads
*/
'use strict';

var utils = require('../utils');
var config = require('../config');

/**
* initialise chartbeat functionality
* Decorates the gpt refresh method with chartbeat functionality
* @name init
* @memberof ChartBeat
* @lends ChartBeat
*/
function ChartBeat() {}

ChartBeat.prototype.init = function () {
	var gpt = config('gpt') || {};
	var src = '//static.chartbeat.com/js/chartbeat_pub.js';
	this.config = config('chartbeat');

	/* istanbul ignore else  */
	if (this.config) {
		// config must be in a global var
		window._sf_async_config = {
			uid: this.config.uid,
			domain: this.config.domain || location.host,
			useCanonical: this.config.canonical || true,
			zone: this.config.zone || gpt.unitName || gpt.site + '/' + gpt.zone,
			sections: this.config.pageType,
			enableAdRefresh: this.config.enableAdRefresh || false
		};
		window._cbq = window._cbq || [];

		/* istanbul ignore else  */
		if (this.config.loadsJS && !utils.isScriptAlreadyLoaded(src)) {
			// LOAD LIBRARY
			window._sf_endpt = new Date().getTime();
			utils.attach(src, true);
		}

		/* istanbul ignore else  */
		if (this.config.demographics) {
			this.addDemographics(this.config.demographics);
		}
	}

	// Array used to register ad slots with chartbeat
	window._cba = [];

	// add an id attribute to each slot
	// id will be the slots name unless overidden
	utils.on('ready', function (event) {
		var slot = event.detail.slot;
		var name = utils.isNonEmptyString(slot.chartbeat) ? slot.chartbeat : slot.name;
		slot.container.setAttribute('data-cb-ad-id', name);
	});

	// Register GPT slots after they're defined with gpt
	utils.on('complete', function (event) {
		var slot = event.detail.slot;
		/* istanbul ignore else  */
		if (slot.gpt) {
			window._cba.push(function () {
				window.pSUPERFLY.registerGptSlot(slot.gpt.slot, slot.gpt.id);

				// TODO: where do we get this config?
				// (12/8/15)
				// from the call I'm on it would seem this config will come from data attributes on the creative
				// using data attrs seems far more managable than using page configuration due to complexitities
				// with master comapnions and such
				//window.pSUPERFLY.addEngagedAdFilter({engagedSeconds:15, id: slot.gpt.id});
			});
		}
	});

	// Notify chartbeat when a refresh happens
	utils.on('refresh', function (event) {
		if (window.pSUPERFLY) {
			window.pSUPERFLY.refreshAd(event.detail.name);
		}
	});
};

ChartBeat.prototype.addDemographics = function (demographicsObject) {
	// Pass User metadata to chartbeat
	var demographicCodes = Object.keys(demographicsObject).map(function (key) {
		return key + '=' + demographicsObject[key];
	}).join(',');

	window._cbq.push(['_demo', demographicCodes]);
};

ChartBeat.prototype.debug = function () {
	var log = utils.log;

	if (!this.config) {
		return;
	}
	log.start('ChartBeat');

	var asyncConfig = utils.extend({}, window._sf_async_config);

	var attrs = ['uid', 'domain', 'useCanonical', 'zone', 'sections', 'enableAdRefresh'];

	attrs.forEach(function (attribute) {
		log('%c ' + attribute + ':', 'font-weight:bold', asyncConfig[attribute]);
		delete asyncConfig[attribute];
	});

	log.start('Superfly Async Config');
	log.attributeTable(asyncConfig);
	log.end();

	if (this.demographicCodes) {
		log.start('Demographic Codes');
		log.attributeTable(this.demographicCodes);
		log.end();
	}
	log.end();
};
module.exports = new ChartBeat();

},{"../config":90,"../utils":101}],93:[function(require,module,exports){
/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@ft.com
 */
/**
 * FT.ads.targeting is an object providing properties and methods for accessing targeting parameters from various sources including FT Track and Audience Science and passing them into DFP
 * @name targeting
 * @memberof FT.ads

*/
'use strict';

var utils = require('../utils');
var config = require('../config');
var delegate = require("./../../../../ftdomdelegate/lib/delegate.js");

/**
 * The Krux class defines an FT.ads.krux instance
 * @class
 * @constructor
*/
function Krux() {}

Krux.prototype.init = function (impl) {
	this.config = config('krux');
	if (this.config && this.config.id) {

		/* istanbul ignore else  */
		if (!window.Krux) {
			(window.Krux = function () {
				window.Krux.q.push(arguments);
			}).q = [];
		}

		this.api = window.Krux;
		/* istanbul ignore else  */
		if (this.config.attributes) {
			this.setAttributes('page_attr_', this.config.attributes.page || {});
			this.setAttributes('user_attr_', this.config.attributes.user || {});
			this.setAttributes('', this.config.attributes.custom || {});
		}

		var src;
		var m = utils.getLocation().match(/\bkxsrc=([^&]+)/);
		if (m) {
			src = decodeURIComponent(m[1]);
		}
		var finalSrc = /^https?:\/\/([^\/]+\.)?krxd\.net(:\d{1,5})?\//i.test(src) ? src : src === "disable" ? "" : "//cdn.krxd.net/controltag?confid=" + this.config.id;

		utils.attach(finalSrc, true);
		this.events.init();
	} else {
		// can't initialize Krux because no Krux ID is configured, please add it as key id in krux config.
	}
};

/**
* retrieve Krux values from localstorage or cookies in older browsers.
* @name retrieve
* @memberof Krux
* @lends Krux
*/
Krux.prototype.retrieve = function (name) {
	var value;
	name = 'kx' + name;
	/* istanbul ignore else  */
	if (window.localStorage && localStorage.getItem(name)) {
		value = localStorage.getItem(name);
	} else if (utils.cookie(name)) {
		value = utils.cookie(name);
	}

	return value;
};

/**
* retrieve Krux segments
* @name segments
* @memberof Krux
* @lends Krux
*/
Krux.prototype.segments = function () {
	return this.retrieve('segs');
};

/**
* Retrieve all Krux values used in targeting and return them in an object
* Also limit the number of segments going into the ad calls via krux.limit config
* @name targeting
* @memberof Krux
* @lends Krux
*/
Krux.prototype.targeting = function () {
	var segs = this.segments();
	/* istanbul ignore else  */
	if (segs) {
		segs = segs.split(',');
		/* istanbul ignore else  */
		if (config('krux').limit) {
			segs = segs.slice(0, config('krux').limit);
		}
	}

	return {
		"kuid": this.retrieve('user'),
		"ksg": segs,
		"khost": encodeURIComponent(location.hostname),
		"bht": segs && segs.length > 0 ? 'true' : 'false'
	};
};

/**
* An object holding methods used by krux event pixels
* @name events
* @memberof Krux
* @lends Krux
*/
Krux.prototype.events = {
	dwell_time: function dwell_time(config) {
		/* istanbul ignore else  */
		if (config) {
			var fire = this.fire,
			    interval = config.interval || 5,
			    max = config.total / interval || 120,
			    uid = config.id;
			utils.timers.create(interval, (function () {
				return function () {
					fire(uid, { dwell_time: this.interval * this.ticks / 1000 });
				};
			})(), max, { reset: true });
		}
	},
	delegated: function delegated(config) {
		/* istanbul ignore else  */
		if (window.addEventListener) {
			/* istanbul ignore else  */
			if (config) {
				var fire = this.fire;
				var eventScope = function eventScope(kEvnt) {
					return function (e, t) {
						fire(config[kEvnt].id);
					};
				};

				window.addEventListener('load', function () {
					var delEvnt = new delegate(document.body);
					for (var kEvnt in config) {
						/* istanbul ignore else  */
						if (config.hasOwnProperty(kEvnt)) {
							delEvnt.on(config[kEvnt].eType, config[kEvnt].selector, eventScope(kEvnt));
						}
					}
				}, false);
			}
		}
	}
};

Krux.prototype.events.fire = function (id, attrs) {
	/* istanbul ignore else  */
	if (id) {
		attrs = utils.isPlainObject(attrs) ? attrs : {};
		return window.Krux('admEvent', id, attrs);
	}

	return false;
};

Krux.prototype.events.init = function () {
	var event,
	    configured = config('krux') && config('krux').events;
	/* istanbul ignore else  */
	if (utils.isPlainObject(configured)) {
		for (event in configured) {
			/* istanbul ignore else  */
			if (utils.isFunction(this[event])) {
				this[event](configured[event]);
			} else if (utils.isFunction(configured[event].fn)) {
				configured[event].fn(configured[event]);
			}
		}
	}
};

Krux.prototype.setAttributes = function (prefix, attributes) {
	/* istanbul ignore else  */
	if (attributes) {
		Object.keys(attributes).forEach((function (item) {
			this.api('set', prefix + item, attributes[item]);
		}).bind(this));
	}
};

Krux.prototype.debug = function () {
	var log = utils.log;
	if (!this.config) {
		return;
	}
	log.start('Krux©');
	log('%c id:', 'font-weight: bold', this.config.id);

	if (this.config.limit) {
		log('%c segment limit:', 'font-weight: bold', this.config.limit);
	}

	if (this.config.attributes) {
		var attributes = this.config.attributes;
		log.start('Attributes');
		log.start('Page');
		log.attributeTable(attributes.page);
		log.end();

		log.start('User');
		log.attributeTable(attributes.user);
		log.end();

		log.start('Custom');
		log.attributeTable(attributes.custom);
		log.end();
		log.end();
	}
	if (this.config.events) {
		var events = this.config.events;
		log.start('Events');
		if (events.dwell_time) {
			log.start('Dwell Time');
			log('%c interval:', 'font-weight: bold', events.dwell_time.interval);
			log('%c id:', 'font-weight: bold', events.dwell_time.id);
			log('%c total:', 'font-weight: bold', events.dwell_time.total);
			log.end();
		}
		log.start('Delegated');
		log.table(events.delegated);
		log.end();
		log.end();
	}

	var targeting = this.targeting();
	log.start('Targeting');
	log.attributeTable(targeting);
	log.end();

	var tags = utils.arrayLikeToArray(document.querySelectorAll(".kxinvisible"));
	if (tags.length) {
		log.start(tags.length + " Supertag© scripts");
		tags.forEach(function (tag) {
			log(tag.dataset.alias, tag.querySelector("script"));
		});
		log.end();
	}
	log.end();
};

module.exports = new Krux();

},{"../config":90,"../utils":101,"./../../../../ftdomdelegate/lib/delegate.js":6}],94:[function(require,module,exports){
/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@com
 */
/**
 * ads.rubicon provides rubicon real time pricing integration for the FT advertising library
 * @name targeting
 * @memberof ads
*/
'use strict';

var utils = require('../utils');
var config = require('../config');

/**
 * The Rubicon class defines an ads.rubicon instance
 * @class
 * @constructor
*/
function Rubicon() {}

/**
 * initialise rubicon functionality
 * loads dorothy.js from rubicon
 * Decorates the gpt init slot method with rubicon valuation functionality
 * @name init
 * @memberof Rubicon
 * @lends Rubicon
*/
Rubicon.prototype.init = function () {
	this.queue = utils.queue(this.initValuation.bind(this));
	this.config = config('rubicon') || {};
	if (this.config.id && this.config.site) {
		var api = this.config.api || '//tap-cdn.rubiconproject.com/partner/scripts/rubicon/dorothy.js?pc=';
		api += this.config.id + '/' + this.config.site;
		utils.attach(api, true, (function () {
			this.queue.process();
		}).bind(this), (function () {
			this.queue.setProcessor(function (slot) {
				utils.log.error('%s rtp valuation call failed', slot.name);
			}).process();
		}).bind(this));

		utils.on('ready', (function (event) {
			this.queue.add(event.detail.slot);
		}).bind(this));
	}
};

/**
 * initialise rubicon valuation for a slot
 * @name initValuation
 * @memberof Rubicon
 * @lends Rubicon
*/
Rubicon.prototype.initValuation = function (slot) {
	var config = this.config;
	var zone = config.zones ? config.zones[slot.name] : false;
	var size = config.formats ? config.formats[slot.name] : false;

	if (zone && size) {
		// rubicon loves globals
		window.oz_api = 'valuation';
		window.oz_callback = this.valuationCallbackFactory.bind(null, slot, config.target);
		window.oz_ad_server = 'gpt';
		window.oz_async = true;
		window.oz_cached_only = config.cached || true;
		window.oz_site = config.id + '/' + config.site;
		window.oz_ad_slot_size = size;
		window.oz_zone = zone;
		window.oz_insight();
	}
};

/**
 * Valuation request callback factory
 * This generates the callback that receives the data from a valution request, it keeps the slotname in a closure.
 * @name init
 * @memberof Rubicon
 * @lends Rubicon
*/
Rubicon.prototype.valuationCallbackFactory = function (slot, target, results) {
	slot.container.setAttribute('data-o-ads-rtp', results.estimate.tier);
	if (target) {
		slot.targeting.rtp = results.estimate.tier;
	}
};

module.exports = new Rubicon();

},{"../config":90,"../utils":101}],95:[function(require,module,exports){
/* jshint forin: false */

//TODO: jshint complains about the for in loop on line ~102 because it set the myState var before filtering for hasOwnProperty
// I'm not sure what affect moving the myState var will have (it's used above too) so this need to be refactored at some point

'use strict';

var utils = require('./utils');

// TODO: remove this in o-ads version 3
function getLoginInfo() {
	utils.log.warn('The metadata getLoginInfo method will be deprecated and will not available in future major versions of o-ads.');
	return {};
}

// TODO: remove this in o-ads version 3
function getAyscVars(obj) {
	utils.log.warn('The metadata getAsycVars method will be deprecated and will not available in future major versions of o-ads.');
	return {};
}

//TODO: review the need of this function & remove in o-ads version 3
module.exports.getPageType = function () {
	utils.log.warn('The metadata getPageType method will be deprecated and will not available in future major versions of o-ads.');
	return {};
};

// TODO: remove these from o-ads version 3
module.exports.page = function () {
	utils.log.warn('The metadata page method has been deprecated and will not available in future major versions of o-ads.');
	return {};
};

module.exports.user = function () {
	utils.log.warn('The metadata user method has been deprecated and will not available in future major versions of o-ads.');
	return {};
};

module.exports.getAyscVars = getAyscVars;
module.exports.getLoginInfo = getLoginInfo;

},{"./utils":101}],96:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var config = require('./config');

var attributeParsers = {
	sizes: function sizes(value, _sizes) {
		if (value === false || value === 'false') {
			return false;
		}
		/* istanbul ignore else  */
		else if (utils.isArray(_sizes)) {
				value.replace(/(\d+)x(\d+)/g, function (match, width, height) {
					_sizes.push([parseInt(width, 10), parseInt(height, 10)]);
				});
			}

		return _sizes;
	},

	formats: function formats(value, sizes) {
		if (value === false || value === 'false') {
			sizes = false;
		} else {
			var mapping = config().formats;
			var formats = utils.isArray(value) ? value : value.split(',');
			formats.forEach(function (format) {
				if (mapping && mapping[format]) {
					format = mapping[format];
					if (utils.isArray(format.sizes[0])) {
						for (var j = 0; j < format.sizes.length; j++) {
							sizes.push(format.sizes[j]);
						}
					} else {
						sizes.push(format.sizes);
					}
				} else {
					utils.log.error('Slot configured with unknown format ' + format);
				}
			});
		}

		return sizes;
	},

	responsiveSizes: function responsiveSizes(name, value, sizes) {
		var screenName = name.replace(/^sizes/, '').toLowerCase();
		if (!utils.isPlainObject(sizes)) {
			sizes = {};
		}

		sizes[screenName] = attributeParsers.sizes(value, sizes[screenName] || []);
		return sizes;
	},

	responsiveFormats: function responsiveFormats(name, value, sizes) {
		var screenName = name.replace(/^formats/, '').toLowerCase();
		if (!utils.isPlainObject(sizes)) {
			sizes = {};
		}

		sizes[screenName] = attributeParsers.formats(value, []);
		return sizes;
	},

	targeting: function targeting(value, _targeting) {
		value = utils.hash(value, ';', '=');
		utils.extend(_targeting, value);
		return _targeting;
	},

	base: function base(value) {
		if (value === '' || value === 'true') {
			value = true;
		} else if (value === 'false') {
			value = false;
		}

		return value;
	}
};

/**
* The Slot class.
* @class
* @constructor
*/
function Slot(container, screensize) {
	var slotConfig = config('slots') || {};

	// store the container
	this.container = container;

	// the current responsive screensize
	if (screensize) {
		this.screensize = screensize;
	}

	// init slot dom structure
	this.outer = this.addContainer(container, { 'class': 'o-ads__outer' });
	this.inner = this.addContainer(this.outer, { 'class': 'o-ads__inner' });

	// make sure the slot has a name
	this.setName();
	this.setResponsiveCreative(false);
	slotConfig = slotConfig[this.name] || {};

	// default configuration properties
	this.server = 'gpt';
	this.defer = false;

	// global slots configuration
	this.targeting = slotConfig.targeting || {};
	this.sizes = slotConfig.sizes || [];
	this.center = slotConfig.center || false;
	this.label = slotConfig.label || false;
	this.outOfPage = slotConfig.outOfPage || false;
	this.lazyLoad = slotConfig.lazyLoad || false;
	this.companion = slotConfig.companion === false ? false : true;
	this.collapseEmpty = slotConfig.collapseEmpty;
	this.chartbeat = slotConfig.chartbeat || config('chartbeat');

	if (utils.isArray(slotConfig.formats)) {
		attributeParsers.formats(slotConfig.formats, this.sizes);
	} else if (utils.isPlainObject(slotConfig.formats)) {
		this.sizes = {};
		Object.keys(slotConfig.formats).forEach((function (screenName) {
			this.sizes[screenName] = attributeParsers.formats(slotConfig.formats[screenName], []);
		}).bind(this));
	}

	// extend with imperative configuration options
	this.parseAttributeConfig();

	if (!this.sizes.length && !utils.isPlainObject(this.sizes)) {
		utils.log.error('slot %s has no configured sizes!', this.name);
		return false;
	}

	this.centerContainer();
	this.labelContainer();

	this.initResponsive();
	this.initLazyLoad();
}

/**
* parse slot attribute config
*/
Slot.prototype.parseAttributeConfig = function () {
	utils.arrayLikeToArray(this.container.attributes).forEach((function (attribute) {
		var name = utils.parseAttributeName(attribute.name);
		var value = attribute.value;
		if (name === 'formats') {
			this[name] = attributeParsers[name](value, this.sizes);
		} else if (attributeParsers[name]) {
			this[name] = attributeParsers[name](value, this[name]);
		} else if (/^formats\w*/.test(name)) {
			this.sizes = attributeParsers.responsiveFormats(name, value, this.sizes);
		} else if (/^sizes\w*/.test(name)) {
			this.sizes = attributeParsers.responsiveSizes(name, value, this.sizes);
		} else if (this.hasOwnProperty(name)) {
			this[name] = attributeParsers.base(value);
		}
	}).bind(this));
};

Slot.prototype.getAttributes = function () {
	var attributes = {};
	utils.arrayLikeToArray(this.container.attributes).forEach(function (attribute) {
		attributes[utils.parseAttributeName(attribute)] = attribute.value;
	});
	this.attributes = attributes;
	return this;
};

/**
*	Load a slot when it appears in the viewport
*/
Slot.prototype.initLazyLoad = function () {
	/* istanbul ignore else  */
	if (this.lazyLoad) {
		this.defer = true;
		utils.once('inview', (function (slot) {
			slot.fire('render');
		}).bind(null, this), this.container);
	}
	return this;
};

/**
*	Listen to responsive breakpoints and collapse slots
* where the configured size is set to false
*/
Slot.prototype.initResponsive = function () {
	/* istanbul ignore else  */
	if (utils.isPlainObject(this.sizes)) {

		if (!this.hasValidSize()) {
			this.collapse();
		}

		utils.on('breakpoint', function (event) {
			var slot = event.detail.slot;
			slot.screensize = event.detail.screensize;

			if (slot.hasValidSize()) {
				slot.uncollapse();
			} else {
				slot.collapse();
			}
		}, this.container);
	}

	return this;
};

/**
* Maximise the slot when size is 100x100
*/
Slot.prototype.maximise = function (size) {
	if (size && +size[0] === 100 && +size[1] === 100) {
		this.fire('resize', {
			size: ['100%', '100%']
		});
	}
};

/**
*	If the slot doesn't have a name give it one
*/
Slot.prototype.setName = function () {
	this.name = this.container.getAttribute('data-o-ads-name') || this.container.getAttribute('o-ads-name');
	if (!this.name) {
		this.name = 'o-ads-slot-' + Math.floor(Math.random() * 10000);
		this.container.setAttribute('data-o-ads-name', this.name);
	}
	return this;
};

/**
*	If the slot doesn't have a name give it one
*/
Slot.prototype.setResponsiveCreative = function (value) {
	this.responsiveCreative = value;
	return this;
};

/**
* add the empty class to the slot
*/
Slot.prototype.collapse = function () {
	utils.addClass(this.container, 'empty');
	utils.addClass(document.body, 'no-' + this.name);
	return this;
};

/**
* remove the empty class from the slot
*/
Slot.prototype.uncollapse = function () {
	utils.removeClass(this.container, 'empty');
	utils.removeClass(document.body, 'no-' + this.name);
	return this;
};

/**
* call the ad server clear method on the slot if one exists
*/
Slot.prototype.clear = function () {
	/* istanbul ignore else  */
	if (utils.isFunction(this['clearSlot'])) {
		this.clearSlot();
	}

	/* istanbul ignore else  */
	if (this.hasOwnProperty('childSlot')) {
		this.childSlot.clear();
	}

	return this;
};

/**
* call the ad server impression URL for an out of page slot if it has been configured correctly for delayed impressions
*/
Slot.prototype.submitImpression = function () {
	/* istanbul ignore else  */
	if (utils.isFunction(this['submitGptImpression'])) {
		this.submitGptImpression();
	}
	return this;
};

/**
*	fire an event on the slot
*/
Slot.prototype.fire = function (name, data) {
	var details = {
		name: this.name,
		slot: this
	};

	if (utils.isPlainObject(data)) {
		utils.extend(details, data);
	}

	utils.broadcast(name, details, this.container);
	return this;
};

/**
*	add a div tag into the current slot container
**/
Slot.prototype.addContainer = function (node, attrs) {
	var container = '<div ';
	/* istanbul ignore else  */
	if (attrs) {
		Object.keys(attrs).forEach(function (attr) {
			var value = attrs[attr];
			container += attr + '=' + value + ' ';
		});
	}
	container += '></div>';
	node.insertAdjacentHTML('beforeend', container);
	return node.lastChild;
};

Slot.prototype.hasValidSize = function (screensize) {
	screensize = screensize || this.screensize;
	if (screensize && utils.isPlainObject(this.sizes)) {
		return this.sizes[screensize] !== false;
	}

	return true;
};

/**
* Add a center class to the main container
*/
Slot.prototype.centerContainer = function () {
	if (this.center) {
		utils.addClass(this.container, 'center');
	}

	return this;
};

/**
* Add a label class to the main container
*/
Slot.prototype.labelContainer = function () {
	var className;
	if (this.label === true || this.label === 'left') {
		className = 'label-left';
	} else if (this.label === 'right') {
		className = 'label-right';
	}

	utils.addClass(this.container, className);
	return this;
};

module.exports = Slot;

},{"./config":90,"./utils":101}],97:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var config = require('./config');
var Slot = require('./slot');
var elementvis = require("./../../../o-element-visibility/main.js");
var screensize = null;

/**
* The Slots instance tracks all ad slots on the page
* configures global page events used by a slot and
* provides utlity methods that act on all slots
* @constructor
*/
function Slots() {}

function invokeMethodOnSlots(names, method, callback) {
	var slots = [];
	names = names || Object.keys(this);

	/* istanbul ignore else  */
	if (utils.isNonEmptyString(names)) {
		slots.push(names);
	} else if (utils.isArray(names)) {
		slots = names;
	}

	slots.forEach(run.bind(null, this, method));

	if (utils.isFunction(callback)) {
		callback.call(this, slots);
	}

	return this;
}

/*
* Either run a method or fire an event on the named slot.
* @private
* @param slots the slots object
*/
function run(slots, action, name) {
	var slot = slots[name];
	if (slot) {
		if (utils.isFunction(slot[action])) {
			slot[action]();
		} else {
			if (utils.isFunction(slot.fire)) {
				slot.fire(action);
			} else {
				utils.log.warn('Attempted to %s on a non-slot %s', action, name);
			}
		}
	} else {
		utils.log.warn('Attempted to %s non-existant slot %s', action, name);
	}
}

/**
* Given a slot name or an array of slot names will collapse the slots using the collapse method on the slot
*/
Slots.prototype.collapse = function (names) {
	return invokeMethodOnSlots.call(this, names, 'collapse');
};

/**
* Given a slot name or an array of slot names will uncollapse the slots using the uncollapse method on the slot
*/
Slots.prototype.uncollapse = function (names) {
	return invokeMethodOnSlots.call(this, names, 'uncollapse');
};

/**
* Given a slot name or an array of slot names of slotnames will refresh the slots using the refresh method on the slot
*/
Slots.prototype.refresh = function (names) {
	return invokeMethodOnSlots.call(this, names, 'refresh');
};

/**
* Given a slot name or an array of slot names will clear the slots using the clear method on the slot
*/
Slots.prototype.clear = function (names) {
	return invokeMethodOnSlots.call(this, names, 'clear');
};

/**
* Given a slot name or an array of slot names will clear the slots using the clear method on the slot and remove the reference to the slot
*/
Slots.prototype.destroy = function (names) {
	return invokeMethodOnSlots.call(this, names, 'clear', function (names) {
		names.forEach((function (name) {
			this[name] = null;
			delete this[name];
		}).bind(this));
	});
};

/**
* Given a slot name will submit a delayed impression for the slot
*/
Slots.prototype.submitImpression = function (name) {
	return invokeMethodOnSlots.call(this, name, 'submitImpression');
};

/**
* Confirms a container in the page exists and creates a Slot object
*/
Slots.prototype.initSlot = function (container, isPublic) {
	// if container is a string this is a legacy implementation using ids
	// find the element and remove the ID in favour of a data attribute
	isPublic = isPublic === false ? false : true;
	if (utils.isString(container)) {
		container = document.getElementById(container) || document.querySelector('[data-o-ads-name="' + container + '"]');
		if (container && container.id) {
			container.setAttribute('data-o-ads-name', container.id);
			container.removeAttribute('id');
		}
	}

	// if not an element or we can't find it in the DOM exit
	if (!utils.isElement(container)) {
		utils.log.error('slot container must be an element!', container);
		return false;
	}

	// add the aria hidden attribute
	container.setAttribute('aria-hidden', 'true');

	var slot = new Slot(container, screensize);
	/* istanbul ignore else  */
	if (slot && !this[slot.name] && isPublic) {
		this[slot.name] = slot;
		slot.elementvis = elementvis.track(slot.container);
		slot.fire('ready');

		if (slot.outOfPage && slot.gpt && slot.gpt.hasOwnProperty('oop')) {
			slot.childSlot = this.initSlot(slot.name + '-oop', false);
		}
	} else if (this[slot.name]) {
		utils.log.error('slot %s is already defined!', slot.name);
	}

	return slot;
};

Slots.prototype.initRefresh = function () {
	if (config('flags').refresh && config('refresh')) {
		var data = config('refresh');
		/* istanbul ignore else  */
		if (data.time && !data.inview) {
			this.timers.refresh = utils.timers.create(data.time, this.refresh.bind(this), data.max || 0);
		}
	}

	return this;
};

Slots.prototype.initInview = function () {
	/* istanbul ignore else  */
	if (config('flags').inview) {
		onLoad(this);
	}

	function onLoad(slots) {
		document.documentElement.addEventListener('oVisibility.inview', onInview.bind(null, slots));
		slots.forEach(function (slot) {
			slot.elementvis.updatePosition();
			slot.elementvis.update(true);
		});
	}

	function onInview(slots, event) {
		var element = event.detail.element;
		var name = element.node.getAttribute('data-o-ads-name');
		if (slots[name]) {
			var slot = slots[name];

			slot.inviewport = event.detail.inviewport;
			slot.percentage = event.detail.percentage;
			/* istanbul ignore else  */
			if (slot.inviewport) {
				slot.fire('inview', event.detail);
			}
		}
	}

	return this;
};

/*
*	listens for the rendered event from a slot and fires the complete event,
* after extending the slot with information from the server.
*/
Slots.prototype.initRendered = function () {
	utils.on('rendered', (function (slots, event) {
		var slot = slots[event.detail.name];
		/* istanbul ignore else  */
		if (slot) {
			utils.extend(slot[slot.server], event.detail[slot.server]);
			var size = event.detail.gpt.size;
			slot.maximise(size);
			slot.fire('complete', event.detail);
		}
	}).bind(null, this));
	return this;
};

/*
* if responsive configuration exists listen for breakpoint changes
*/
Slots.prototype.initResponsive = function () {
	var breakpoints = config('responsive');
	/* istanbul ignore else  */
	if (utils.isObject(breakpoints)) {
		screensize = utils.responsive(breakpoints, onBreakpointChange.bind(null, this));
	}

	return this;
};

/*
* called when a responsive breakpoint is crossed though window resizing or orientation change.
*/
function onBreakpointChange(slots, screensize) {
	slots.forEach(function (slot) {
		/* istanbul ignore else  */
		if (slot) {
			slot.screensize = screensize;
			slot.fire('breakpoint', { screensize: screensize });
		}
	});
}

/*
* Initialise the postMessage API
*/
Slots.prototype.initPostMessage = function () {
	// Listen for messages coming from ads
	window.addEventListener('message', pmHandler.bind(null, this), false);

	function pmHandler(slots, event) {
		var data = utils.messenger.parse(event.data);
		/* istanbul ignore else  don't process messages with a non oAds type*/
		if (data.type && (/^oAds\./.test(data.type) || /^touch/.test(data.type))) {
			var type = data.type.replace('oAds\.', '');
			var slot = data.name ? slots[data.name] : false;
			if (type === 'whoami' && event.source) {
				var messageToSend = { type: 'oAds.youare' };
				var slotName = utils.iframeToSlotName(event.source.window);
				slot = slots[slotName] || false;

				if (slot) {
					if (data.collapse) {
						slot.collapse();
					}

					messageToSend.name = slotName;
					messageToSend.sizes = slot.sizes;

					utils.messenger.post(messageToSend, event.source);
				} else {
					utils.log.error('Message received from unidentified slot');
					utils.messenger.post(messageToSend, event.source);
				}
			} else if (type === 'responsive') {
				slot.setResponsiveCreative(true);
			} else if (utils.isFunction(slot[type])) {
				slot[type]();
			} else if (/^touch/.test(data.type)) {
				slots[data.name].fire('touch', data);
			} else {
				delete data.type;
				delete data.name;
				slot.fire(type, data);
			}
		}
	}
};

Slots.prototype.forEach = function (fn) {
	Object.keys(this).forEach((function (name) {
		var slot = this[name];
		/* istanbul ignore else  */
		if (slot instanceof Slot) {
			fn.call(this, slot);
		}
	}).bind(this));
	return this;
};

/*
* Initialise slots
*/
Slots.prototype.init = function () {
	this.initRefresh();
	this.initInview();
	this.initRendered();
	this.initResponsive();
	this.initPostMessage();
};

Slots.prototype.timers = {};

Slots.prototype.debug = function () {
	var log = utils.log;
	var data = [];

	this.forEach(function (slot) {
		var row = {
			name: slot.name,
			'unit name': slot.gpt.unitName,
			'creative id': slot.gpt.creativeId || 'N/A',
			'line item id': slot.gpt.lineItemId || 'N/A',
			size: utils.isArray(slot.gpt.size) && slot.gpt.size.join('×') || slot.gpt.isEmpty && 'empty' || 'N/A',
			sizes: utils.isArray(slot.sizes) && slot.sizes.map(function (item) {
				return item.join('×');
			}).join(', ') || 'responsive slot',
			targeting: Object.keys(slot.targeting).map(function (param) {
				return param + '=' + slot.targeting[param];
			}).join(', ')
		};
		data.push(row);
	});

	log.start('Creatives');
	log.table(data);
	log.end();
};

module.exports = new Slots();

},{"./../../../o-element-visibility/main.js":109,"./config":90,"./slot":96,"./utils":101}],98:[function(require,module,exports){
/* jshint forin: false */

//TODO: refactor the asyc code, it's nasty

/**
* @fileOverview
* Third party library for use with google publisher tags.
*
* @author Robin Marr, robin.marr@ft.com
*/

/**
* FT.ads.targeting is an object providing properties and methods for accessing targeting parameters from various sources including FT Track and Audience Science and passing them into DFP
* @name targeting
* @memberof FT.ads
*/

'use strict';

var config = require('./config');
var krux = require('./data-providers/krux');
var version = require('./version');
var utils = require('./utils');
var parameters = {};

/**
* The Targeting class defines an ads.targeting instance
* @class
* @constructor
*/
function Targeting() {}

Targeting.prototype.get = function () {
	var item;
	var methods = {
		krux: this.fetchKrux,
		socialReferrer: this.getSocialReferrer,
		pageReferrer: this.getPageReferrer,
		cookieConsent: this.cookieConsent,
		timestamp: this.timestamp,
		version: this.version
	};

	utils.extend(parameters, this.getFromConfig(), this.encodedIp(), this.searchTerm());

	for (item in methods) {
		if (methods.hasOwnProperty(item) && config(item)) {
			utils.extend(parameters, methods[item]());
		}
	}

	return parameters;
};

Targeting.prototype.add = function (obj) {
	/* istanbul ignore else  */
	if (utils.isPlainObject(obj)) {
		utils.extend(parameters, obj);
	}
};

Targeting.prototype.clear = function () {
	parameters = {};
};

Targeting.prototype.encodedIp = function () {
	var DFPPremiumIPReplaceLookup = {
		0: { replaceRegex: /0/g, replaceValue: 'a' },
		1: { replaceRegex: /1/g, replaceValue: 'b' },
		2: { replaceRegex: /2/g, replaceValue: 'c' },
		3: { replaceRegex: /3/g, replaceValue: 'd' },
		4: { replaceRegex: /4/g, replaceValue: 'e' },
		5: { replaceRegex: /5/g, replaceValue: 'f' },
		6: { replaceRegex: /6/g, replaceValue: 'g' },
		7: { replaceRegex: /7/g, replaceValue: 'h' },
		8: { replaceRegex: /8/g, replaceValue: 'i' },
		9: { replaceRegex: /9/g, replaceValue: 'j' },
		'.': { replaceRegex: /\./g, replaceValue: 'z' }
	};

	function getIP() {
		var ip;
		var tmp;
		var ipTemp;
		var ftUserTrackVal = utils.cookie('FTUserTrack');

		// sample FTUserTrackValue = 203.190.72.182.1344916650137365
		if (ftUserTrackVal) {
			ip = ftUserTrackVal;
			tmp = ftUserTrackVal.match(/^\w{1,3}\.\w{1,3}\.\w{1,3}\.\w{1,3}\.\w+$/);
			if (tmp) {
				tmp = tmp[0];
				ipTemp = tmp.match(/\w{1,3}/g);
				/* istanbul ignore else  */
				if (ipTemp) {
					ip = ipTemp[0] + '.' + ipTemp[1] + '.' + ipTemp[2] + '.' + ipTemp[3];
				}
			}
		}

		return ip;
	}

	function encodeIP(ip) {
		var encodedIP;
		var lookupKey;

		if (ip) {
			encodedIP = ip;
			for (lookupKey in DFPPremiumIPReplaceLookup) {
				/* istanbul ignore else  */
				if (DFPPremiumIPReplaceLookup.hasOwnProperty(lookupKey)) {
					encodedIP = encodedIP.replace(new RegExp(DFPPremiumIPReplaceLookup[lookupKey].replaceRegex), DFPPremiumIPReplaceLookup[lookupKey].replaceValue);
				}
			}
		}

		return encodedIP;
	}

	/**
   * returns an object with key loc and a value of the encoded ip
   * @memberof Targeting
   * @lends Targeting
 */
	return { loc: encodeIP(getIP()) };
};

/**
* getFromConfig returns an object containing all the key values pairs specified in the dfp_targeting
* config.
* @name getFromConfig
* @memberof Targeting
* @lends Targeting
*/
Targeting.prototype.getFromConfig = function () {
	var targeting = config('dfp_targeting') || {};
	if (!utils.isPlainObject(targeting)) {
		/* istanbul ignore else  */
		if (utils.isString(targeting)) {
			targeting = utils.hash(targeting, ';', '=');
		}
	}

	return targeting;
};

Targeting.prototype.fetchKrux = function () {
	return krux.targeting();
};

Targeting.prototype.getPageReferrer = function () {
	var hostRegex;
	var match = null;
	var referrer = utils.getReferrer();

	//referrer is not article
	if (referrer !== '') {
		hostRegex = /^.*?:\/\/.*?(\/.*)$/;

		//remove hostname from results
		match = hostRegex.exec(referrer)[1];
		/* istanbul ignore else  */
		if (match !== null) {
			match.substring(1);
		}
	}

	return match && { rf: match.substring(1) } || {};
};

Targeting.prototype.getSocialReferrer = function () {
	var codedValue;
	var refUrl;
	var referrer = utils.getReferrer();
	var refererRegexTemplate = '^http(|s)://(www.)*(SUBSTITUTION)/|_i_referer=http(|s)(:|%3A)(\/|%2F){2}(www.)*(SUBSTITUTION)(\/|%2F)';
	var lookup = {
		't.co': 'twi',
		'facebook.com': 'fac',
		'linkedin.com': 'lin',
		'drudgereport.com': 'dru'
	};

	/* istanbul ignore else  */
	if (utils.isString(referrer)) {
		for (refUrl in lookup) {
			/* istanbul ignore else  */
			if (lookup.hasOwnProperty(refUrl)) {
				var refererRegex = new RegExp(refererRegexTemplate.replace(/SUBSTITUTION/g, refUrl));
				if (refUrl !== undefined && refererRegex.test(referrer)) {
					codedValue = lookup[refUrl];
					break;
				}
			}
		}
	}

	return codedValue && { socref: codedValue } || {};
};

Targeting.prototype.cookieConsent = function () {
	return { cc: utils.cookie('cookieconsent') === 'accepted' ? 'y' : 'n' };
};

Targeting.prototype.searchTerm = function () {
	var qs = utils.hash(utils.getQueryString(), /\&|\;/, '=');
	var keywords = qs.q || qs.s || qs.query || qs.queryText || qs.searchField || undefined;

	if (keywords && keywords !== '') {
		keywords = unescape(keywords).toLowerCase().replace(/[';\^\+]/g, ' ').replace(/\s+/g, ' ').trim();
	}

	return { kw: keywords };
};

Targeting.prototype.timestamp = function () {
	return { ts: utils.getTimestamp() };
};

Targeting.prototype.version = function () {
	return { ver: version.artifactVersion };
};

Targeting.prototype.debug = function () {
	var log = utils.log;
	var parameters = this.get();
	if (Object.keys(parameters).length === 0) {
		return;
	}

	log.start('Targeting');
	log.attributeTable(this.get());
	log.end();
};

module.exports = new Targeting();

},{"./config":90,"./data-providers/krux":93,"./utils":101,"./version":107}],99:[function(require,module,exports){
/**
 * Utility methods for reading.writing cookie. Inspired by the jQuery Cookie plugin (https://github.com/carhartl/jquery-cookie).
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils/cookie
 * @see utils
 */

'use strict';

var utils = require('./index.js'),
    pluses = /\+/g,
    today = new Date();

function raw(s) {
	return s;
}

function decoded(s) {
	return decodeURIComponent(s.replace(pluses, ' '));
}

/*
*	Read or write a cookie
* @exports utils/cookie
* @param {string} key the name of the cookie to be read/written
* @param {string} value The value to set to the written cookie (if param is missing the cookie will be read)
* @param {object} options Expires,
*/
var config = module.exports.cookie = function (key, value, options) {
	// write
	if (value !== undefined) {
		options = utils.extend({}, config.defaults, options);

		if (value === null) {
			options.expires = -1;
		}

		if (typeof options.expires === 'number') {
			var days = options.expires,
			    t = options.expires = new Date();
			t.setDate(t.getDate() + days);
		}

		value = config.json ? JSON.stringify(value) : String(value);
		value = config.raw ? value : encodeURIComponent(value);
		if (!!options.expires && options.expires.valueOf() - today.valueOf() < 0) {
			delete utils.cookies[encodeURIComponent(key)];
		} else {
			utils.cookies[encodeURIComponent(key)] = value;
		}

		return document.cookie = [encodeURIComponent(key), '=', value, options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
		options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join('');
	}

	// read
	var decode = config.raw ? raw : decoded;
	var cookie = utils.cookies[encodeURIComponent(key)];
	if (!!cookie || cookie === '') {
		return config.json ? JSON.parse(decode(cookie)) : decode(cookie);
	}

	return null;
};

config.defaults = {};

/*
* Delete a cookie
* @exports utils/cookie/removeCookie
* @param {string} name The cookie's name
* @param {object} options see options above
*/
module.exports.removeCookie = function (key, options) {
	if (module.exports.cookie(key) !== null) {
		module.exports.cookie(key, null, options);
		return true;
	}

	return false;
};

/*
* Get the regex required to parse values from a cookie
* @private
* @param {string} name The cookie's name
* @param {string} param The parameter's name
* @return {string|undefined}
*/
function getRegExp(name, param) {
	var re,
	    formats = {
		"AYSC": "underscore",
		"FT_U": "underscoreEquals",
		"FT_Remember": "colonEquals",
		"FT_User": "colonEquals",
		"FTQA": "commaEquals"
	};

	switch (formats[name]) {
		case "underscore":
			re = '_' + param + '([^_]*)_';
			break;
		case "underscoreEquals":
			re = '_' + param + '=([^_]*)_';
			break;
		case "colonEquals":
			re = ':' + param + '=([^:]*)';
			break;
		case "commaEquals":
			re = param + '=([^,]*)';
			break;
		default:
			re = /((.|\n)*)/; // match everything
			break;
	}
	return new RegExp(re);
}

/*
* Get a parameter from a named cookie
* @exports utils/cookie/getCookieParam
* @param {string} name The cookie's name
* @param {string} param The parameter's name
* @return {string|undefined}
*/
module.exports.getCookieParam = function (name, param) {
	var matches,
	    wholeValue = module.exports.cookie(name) || "";
	/* istanbul ignore else  */
	if (param) {
		matches = wholeValue.match(getRegExp(name, param));
	}

	return matches && matches.length ? matches[1] : undefined;
};

/*
* Parse document.cookie into an object for easier reading
* @name cookies
* @member cookie
*/
module.exports.cookies = utils.hash(document.cookie, ';', '=');

},{"./index.js":101}],100:[function(require,module,exports){
/**
 * Utility methods for o-ads events. Methods defined here are added to the utils object not the utils.event object.
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils/events
 * @see utils
 */
'use strict'

/**
* Broadscasts an o-ads event
* @param {string} name The name of the cookie to be read/written
* @param {object} data The value to set to the written cookie (if param is missing the cookie will be read)
* @param {HTMLElement} target The element to attach the event listener to
*/
;
module.exports.broadcast = broadcast;
function broadcast(name, data, target) {
	/* istanbul ignore next: ignore the final fallback as hard trigger */
	target = target || document.body || document.documentElement;
	name = 'oAds.' + name;
	var opts = {
		bubbles: true,
		cancelable: true,
		detail: data
	};
	target.dispatchEvent(new CustomEvent(name, opts));
}

/**
* Sets an event listener for an oAds event
* @param {string} name The name of the cookie to be read/written
* @param {function} callback The value to set to the written cookie (if param is missing the cookie will be read)
* @param {HTMLElement} target The element to attach the event listener to
*/

module.exports.on = on;
function on(name, callback, target) {
	name = 'oAds.' + name;
	/* istanbul ignore next: ignore the final fallback as hard trigger */
	target = target || document.body || document.documentElement;
	target.addEventListener(name, callback);
}

/**
* Sets a one time event listener for an oAds event
* @param {string} name The name of the cookie to be read/written
* @param {function} callback The value to set to the written cookie (if param is missing the cookie will be read)
* @param {HTMLElement} target The element to attach the event listener to
*/
module.exports.once = once;
function once(name, callback, target) {
	var handler = function handler(event) {
		/* istanbul ignore next: ignore the final fallback as hard trigger */
		var targ = event.target || event.srcElement;
		targ.removeEventListener('oAds.' + name, callback);
		if (callback) {
			callback(event);

			// we set callback to null so if for some reason the listener isn't removed the callback will still only be called once
			callback = null;
		}
	};

	on(name, handler, target);
}

},{}],101:[function(require,module,exports){
/**
 * Utility methods for the advertising library.
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils
 */
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var hop = Object.prototype.hasOwnProperty;

var utils = module.exports;
/**
 * Uses object prototype toString method to get at the type of object we are dealing,
 * IE returns [object Object] for null and undefined so we need to filter those
 * http://es5.github.com/#x15.2.4.2
 * @private
 * @param {object} Any javascript object
 * @returns The type of the object e.g Array, String, Object
 */
function is(object) {
	var type = Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];

	if (object === null) {
		return "Null";
	} else if (object === undefined) {
		return "Undefined";
	} else {
		return type;
	}
}

/**
 * Creates a method for testing the type of an Object
 * @private
 * @param {string} The name of the object type to be tested e.g. Array
 * @returns a method that takes any javascript object and tests if it is of
 * the supplied className
 */
function createIsTest(className) {
	return function (obj) {
		return is(obj) === className;
	};
}

/**
 * Curries some useful is{ClassName} methods into the supplied Object
 * @private
 * @param {object} The object to add the methods too
 * @param {array} A list of types to create methods for defaults to "Array", "Object", "String", "Function"
 * @returns The object supplied in the first param with is{ClassName} Methods Added
 */
function curryIsMethods(obj, classNames) {
	classNames = classNames || ['Array', 'Object', 'String', 'Function', 'Storage'];

	while (!!classNames.length) {
		var className = classNames.pop();
		obj['is' + className] = createIsTest(className);
	}

	return obj;
}

/**
 * Test if an object is the global window object
 * @param {object} obj The object to be tested
 * @returns {boolean} true if the object is the window obj, otherwise false
 */
module.exports.isWindow = function (obj) {
	return obj && obj !== null && obj === window;
};

/**
 * Test if an object inherits from any other objects, used in extend
 * to protect against deep copies running out of memory and constructors
 * losing there prototypes when cloned
 * @param {object} obj The object to be tested
 * @returns {boolean} true if the object is plain false otherwise
 */
module.exports.isPlainObject = function (obj) {
	var hop = Object.prototype.hasOwnProperty;

	// Must be an Object.
	// Because of IE, we also have to check the presence of the constructor property.
	// Make sure that DOM nodes and window objects don't pass through, as well
	if (!obj || !utils.isObject(obj) || obj.nodeType || utils.isWindow(obj)) {
		return false;
	}

	try {
		// Not own constructor property must be Object
		if (obj.constructor && !hop.call(obj, 'constructor') && !hop.call(obj.constructor.prototype, 'isPrototypeOf')) {
			return false;
		}
	} catch (e) {
		/* istanbul ignore next  */
		// IE8,9 Will throw exceptions on certain host objects
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.

	var key;
	for (key in obj) {}

	return key === undefined || hop.call(obj, key);
};

/**
 * Test if an object is a string with a length
 * @param {object} str The object to be tested
 * @returns {boolean} true if the object is a string with a length greater than 0
 */
module.exports.isNonEmptyString = function (str) {
	return utils.isString(str) && !!str.length;
};

module.exports.isElement = function (element) {
	return element && element.nodeType === 1 && element.tagName || false;
};

/**
 * Test if an object is a finite number
 * @param {object} The object to be tested
 * @returns {boolean} true if the object is a finite number, can be a float or int but not NaN or Infinity
 */
module.exports.isNumeric = function (num) {
	return !isNaN(parseFloat(num)) && isFinite(num);
};

/**
 * Merge or clone objects
 * @function
 * @param {boolean/object} deep/target If boolean specifies if this should be a deep copy or not, otherwise is the target object for the copy
 * @param {object} target If deep copy is true will be the target object of the copy
 * @param {object} objects All other params are objects to be merged into the target
 * @returns {object} The target object extended with the other params
 */
module.exports.extend = extend;

function extend() {
	/* jshint forin: false */
	/* when doing a deep copy we want to copy prototype properties */
	var options,
	    name,
	    src,
	    copy,
	    copyIsArray,
	    clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};

		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	/* istanbul ignore else  */
	if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && !utils.isFunction(target)) {
		target = {};
	}

	// do nothing if only one argument is passed (or 2 for a deep copy)
	/* istanbul ignore else  */
	if (length === i) {
		return target;
	}

	for (; i < length; i++) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) !== null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging arrays
				if (deep && copy && (utils.isPlainObject(copy) || utils.isArray(copy))) {
					copyIsArray = utils.isArray(copy);
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && utils.isArray(src) ? src : [];
					} else {
						clone = src && utils.isObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
				} else if (copy !== undefined) {
						target[name] = copy;
					}
			}
		}
	}

	// Return the modified object
	return target;
}

module.exports.hasClass = function (node, className) {
	/* istanbul ignore else  */
	if (node.nodeType === 1) {
		return node.className.split(' ').indexOf('o-ads__' + className) > -1 ? true : false;
	}

	return false;
};

module.exports.addClass = function (node, className) {
	if (node.nodeType === 1 && utils.isNonEmptyString(className) && !utils.hasClass(node, className)) {
		node.className += ' o-ads__' + className.trim();
	}

	return true;
};

module.exports.removeClass = function (node, className) {
	var index, classes;
	if (node.nodeType === 1 && utils.isNonEmptyString(className) && utils.hasClass(node, className)) {
		classes = node.className.split(' ');
		index = classes.indexOf('o-ads__' + className);
		classes.splice(index, 1);
		node.className = classes.join(' ');
	}

	return true;
};

/**
 * Create an object hash from a delimited string
 * Beware all properties on the resulting object will have string values.
 * @param {string}        str       The string to transform
 * @param {string|regexp} delimiter The character that delimits each name/value pair
 * @param {string}        pairing   The character that separates the name from the value
 * @return {object}
 *
 */
module.exports.hash = function (str, delimiter, pairing) {
	var pair,
	    value,
	    idx,
	    len,
	    hash = {};
	if (str && str.split) {
		str = str.split(delimiter);

		for (idx = 0, len = str.length; idx < len; idx += 1) {
			value = str[idx];
			pair = value.split(pairing);
			if (pair.length > 1) {
				hash[pair[0].trim()] = pair.slice(1).join(pairing);
			}
		}
	}

	return hash;
};

/**
* Takes a script URL as a string value, creates a new script element, sets the src and attaches to the page
* The async value of the script can be set by the seccond parameter, which is a boolean
* Note, we should use protocol-relative URL paths to ensure we don't run into http/https issues
* @param {string} scriptUrl The url to the script file to be added
* @param {boolean} async Set the async attribute on the script tag
* @param {function} callback A function to run when the script loads
* @param {function} errorcb A function to run if the script fails to load
* @returns {HTMLElement} the created script tag
*/
module.exports.attach = function (scriptUrl, async, callback, errorcb) {
	var tag = document.createElement('script');
	var node = document.getElementsByTagName('script')[0];
	var hasRun = false;
	tag.setAttribute('src', scriptUrl);
	tag.setAttribute('o-ads', '');
	/* istanbul ignore else */
	if (async) {
		tag.async = 'true';
	}
	/* istanbul ignore else  */
	if (utils.isFunction(callback)) {
		/* istanbul ignore if - legacy IE code, won't test */
		if (hop.call(tag, 'onreadystatechange')) {
			tag.onreadystatechange = function () {
				if (tag.readyState === "loaded") {
					if (!hasRun) {
						callback();
						hasRun = true;
					}
				}
			};
		} else {
			tag.onload = function () {
				/* istanbul ignore else  */
				if (!hasRun) {
					callback();
					hasRun = true;
				}
			};
		}
	}

	/* istanbul ignore else  */
	if (utils.isFunction(errorcb)) {
		tag.onerror = function () {
			/* istanbul ignore else  */
			if (!hasRun) {
				errorcb();
				hasRun = true;
			}
		};
	}
	// Use insert before, append child has issues with script tags in some browsers.
	node.parentNode.insertBefore(tag, node);
	return tag;
};

/*
* Test to see if a script file is already referenced from the dom
* @param {string} url The URL to look for
* @return {boolean} true if the file is already referenced else false
*/
module.exports.isScriptAlreadyLoaded = function (url) {
	var scripts = document.getElementsByTagName('script');
	for (var i = scripts.length; i--;) {
		if (scripts[i].src === url) return true;
	}

	return false;
};

/*
* Make a cross domain XHR request
* @param {string} The url to request
* @param {string} THe method of the request (GET, POST).
* @param {function} callback A function to run when the request succeeds
* @param {function} A function to run if the request fails
* @returns {HTMLElement} the created XHR object
*/
module.exports.createCORSRequest = function (url, method, callback, errorcb) {
	var xhr = new XMLHttpRequest();
	/* istanbul ignore else - legacy IE code, won't test */
	if ('withCredentials' in xhr) {
		xhr.open(method, url, true);
		xhr.responseType = 'json';
	} else if (typeof XDomainRequest !== "undefined") {
		xhr = new XDomainRequest();
		xhr.open(method, url, true);
	} else {
		xhr = null;
		errorcb();
	}

	xhr.onload = function (xhrEvent) {
		callback.call(this, this.response || this.responseText, xhrEvent);
	};

	if (utils.isFunction(errorcb)) {
		xhr.onerror = errorcb();
		xhr.ontimeout = errorcb();
	}

	xhr.send();
	return xhr;
};

/**
* return the current documents referrer or an empty string if non exists
* This method enables us to mock the referrer in our tests reliably and doesn't really serve any other purpose
* @returns {string} document.referrer
*/
/* istanbul ignore next - cannot reliably test value of referer */
module.exports.getReferrer = function () {
	return document.referrer || '';
};

/**
* Capitalise a string
* @param {string} string the string to capitalise
* @returns {string}
*/
module.exports.capitalise = function (string) {
	return string.replace(/(^[a-z])/, function (match, letter) {
		return letter.toUpperCase();
	});
};

/**
* Remove hyphens from a string and upper case the following letter
* @param {string} string the string to parse
* @returns {string}
*/
module.exports.dehyphenise = function (string) {
	return string.replace(/(-)([a-z])/g, function (match, hyphen, letter) {
		return letter.toUpperCase();
	});
};

/**
* Find uppercase characters in a string, lower case them and add a preceding hyphen
* @param {string} string the string to parse
* @returns {string}
*/
module.exports.hyphenise = function (string) {
	return string.replace(/([A-Z])/g, function (match, letter) {
		return '-' + letter.toLowerCase();
	});
};

/**
* remove prefixes from o-ads data attributes and dehyphenise the name
* @param {string|} name the name of the attribute to parse
* @returns {string}
*/
module.exports.parseAttributeName = function (attribute) {
	var name = utils.isString(attribute) ? attribute : attribute.name;
	return utils.dehyphenise(name.replace(/(data-)?o-ads-/, ''));
};

/**
* return the current documents url or an empty string if non exists
* This method enables us to mock the document location string in our tests reliably and doesn't really serve any other purpose
* @returns {string}
*/
/* istanbul ignore next - cannot reliably test value of location */
module.exports.getLocation = function () {
	return document.location.href || '';
};

/**
* return the current documents search or an empty string if non exists
* also strips the initial ? from the search string for easier parsing
* This method enables us to mock the search string in our tests reliably and doesn't really serve any other purpose
* @returns {string}
*/
module.exports.getQueryString = function () {
	return document.location.search.substring(1) || '';
};

/**
* returns a timestamp of the current date/time in the format YYYYMMDDHHMMSS
* @returns {string}
*/
module.exports.getTimestamp = function () {
	var now = new Date();
	return [now.getFullYear(), ('0' + (now.getMonth() + 1)).slice(-2), ('0' + now.getDate()).slice(-2), ('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2), ('0' + now.getSeconds()).slice(-2)].join("");
};

/**
* Converts an array like object e.g arguments into a full array
* @param {object}  obj an Array like object to convert
* @returns {array}
*/
module.exports.arrayLikeToArray = function (obj) {
	var array = [];
	try {
		array = Array.prototype.slice.call(obj);
	} catch (error) {
		/* istanbul ignore next  */
		for (var i = 0; i < obj.length; i++) {
			array[i] = obj[i];
		}
	}

	return array;
};

// capture all iframes in the page in a live node list
var iframes = document.getElementsByTagName('iframe');

/**
* Given the window object of an iframe this method returns the o-ads slot name
* that rendered the iframe, if the iframe was not rendered by o-ads this will
* return false
* @param {window}  a window object
* @returns {String|Boolean}
*/
module.exports.iframeToSlotName = function (iframeWindow) {
	var slotName, node;
	var i = iframes.length;

	// Figure out which iframe DOM node we have the window for
	while (i--) {
		/* istanbul ignore else  */
		if (iframes[i].contentWindow === iframeWindow) {
			node = iframes[i];
			break;
		}
	}
	/* istanbul ignore else  */
	if (node) {
		// find the closest parent with a data-o-ads-name attribute, that's our slot name
		while (node.parentNode) {
			slotName = node.getAttribute('data-o-ads-name');
			/* istanbul ignore else  */
			if (slotName) {
				return slotName;
			}

			node = node.parentNode;
		}
	}

	return false;
};

extend(module.exports, require('./cookie.js'));
extend(module.exports, require('./events.js'));
extend(module.exports, require('./messenger.js'));
module.exports.responsive = require('./responsive.js');
module.exports.timers = require('./timers.js')();
module.exports.queue = require('./queue.js');
module.exports.log = require('./log');
curryIsMethods(module.exports);

},{"./cookie.js":99,"./events.js":100,"./log":102,"./messenger.js":103,"./queue.js":104,"./responsive.js":105,"./timers.js":106}],102:[function(require,module,exports){
/**
 * Utility methods for logging.
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils/log
 * @see utils
 */

/* jshint devel: true */
'use strict';

module.exports = log;

/**
 * Safe logger for the browser
 * @exports utils/log
 * @param {string} type Sets the type of log message log, warn, error or info, if not set to one of these values log will be used
 * @param {any} args the arguments to be passed to console[type]
 */
function log() {
	var type, args, argsIndex;
	if ('log warn error info'.indexOf(arguments[0]) === -1) {
		type = 'log';
		argsIndex = 0;
	} else {
		type = arguments[0];
		argsIndex = 1;
	}

	args = [].slice.call(arguments, argsIndex);

	if (log.isOn(type)) {
		window.console[type].apply(window.console, args);
	}
}

/**
 * Determine if debug logging is on and if the type if supported
 * @param {string} type
 */
module.exports.isOn = function (type) {
	/* istanbul ignore else  */
	var debug = localStorage.getItem('oAds') || location.search.indexOf('DEBUG=OADS') !== -1;
	return debug && window.console && window.console[type];
};

/**
 * Log a warning message
 */
module.exports.warn = function () {
	var args = ['warn'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

/**
 * Log an error message
 */
module.exports.error = function () {
	var args = ['error'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

/**
 * Log an info message
 */
module.exports.info = function () {
	var args = ['info'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

/**
 * Start a collapsed group
 * @param {string} group the name of the group, defaults to o-ads
 */
module.exports.start = function (group) {
	if (!log.isOn('groupCollapsed')) {
		return;
	}

	window.console.groupCollapsed(group || 'o-ads');
};

/**
 * End a collapsed group
 */
module.exports.end = function () {
	if (!log.isOn('groupEnd')) {
		return;
	}

	window.console.groupEnd();
};

module.exports.table = function (data, columns) {
	if (log.isOn('log') && window.console) {
		if (console.table) {
			console.table(data, columns);
		} else {
			console.log(data);
		}
	}
};

module.exports.attributeTable = function (object, columns) {
	var utils = require('../utils');
	if (log.isOn('log') && window.console) {
		if (console.table) {
			var data = Object.keys(object).map(function (item) {
				var val;
				if (utils.isArray(object[item]) || utils.isObject(object[item])) {
					val = JSON.stringify(object[item]);
				} else {
					val = object[item];
				}
				return {
					key: item,
					value: val
				};
			});
			console.table(data, columns);
		} else {
			console.log(object);
		}
	}
};

},{"../utils":101}],103:[function(require,module,exports){
/**
 * Utility methods for postMessage api.
 * @author Origami Advertising, origami.advertising@ft.com
 * @module utils
 */
'use strict';

module.exports.messenger = {
	post: function post(message, source) {
		message = typeof message === 'string' ? message : JSON.stringify(message);
		source = arguments[1] || window.top;
		source.postMessage(message, '*');
	},
	parse: function parse(message) {
		// try returning the parsed object
		try {
			return JSON.parse(message);
		}
		// return the original message
		catch (e) {
			return message;
		}
	}
};

},{}],104:[function(require,module,exports){
'use strict';

function Queue(processor) {
	if (!(this instanceof Queue)) {
		return new Queue(processor);
	}

	this.items = [];
	this.processed = false;
	this.processor = processor || function () {};
}

Queue.prototype.setProcessor = function (processor) {
	this.processor = processor;
	return this;
};

Queue.prototype.process = function () {
	this.processed = true;
	for (var i = 0, j = this.items.length; i < j; i++) {
		this.processor(this.items[i]);
	}

	return this;
};

Queue.prototype.add = function (item) {
	if (this.processed === true) {
		this.processor(item);
	} else {
		this.items.push(item);
	}

	return this;
};

module.exports = Queue;

},{}],105:[function(require,module,exports){
'use strict';

var callback, breakpoints, current;
var utils = require('./index.js');
var oViewport = require("./../../../../o-viewport/main.js");

function getNearestBreakpoint() {
	var winner;
	var dims = oViewport.getSize();
	function findCurrentBreakpoint(breakpoint) {
		var breakpointDims = breakpoints[breakpoint];
		if (dims.width >= breakpointDims[0] && dims.height >= breakpointDims[1]) {
			if (!winner || breakpointDims[0] >= breakpoints[winner][0]) {
				winner = breakpoint;
			}
		}
	}

	Object.keys(breakpoints).forEach(findCurrentBreakpoint);

	return winner;
}

function fire() {
	var winner = getNearestBreakpoint();

	if (current !== winner) {
		setCurrent(winner);
		callback(winner);
	}
}

function setCurrent(name) {
	current = name;
}

function getCurrent() {
	return current;
}

function init(brps, cb) {

	if (!utils.isFunction(cb)) {
		// must have a call back function
		return false;
	}

	breakpoints = brps;
	callback = cb;

	setCurrent(getNearestBreakpoint());
	document.body.addEventListener('oViewport.orientation', fire);
	document.body.addEventListener('oViewport.resize', fire);
	oViewport.listenTo('orientation');
	oViewport.listenTo('resize');

	return getCurrent();
}

module.exports = init;
module.exports.getCurrent = getCurrent;
module.exports.setThrottleInterval = oViewport.setThrottleInterval;

},{"./../../../../o-viewport/main.js":133,"./index.js":101}],106:[function(require,module,exports){
'use strict';

function now() {
	return new Date().valueOf();
}

function Timer(interval, fn, maxTicks, opts) {
	this.interval = (parseFloat(interval) || 1) * 1000;
	this.maxTicks = parseInt(maxTicks, 10) || 0;
	this.fn = fn;
	this.ticks = 0;
	this.opts = opts || {};
	this.start();
	return this;
}

Timer.prototype.tick = function () {
	var Timer = this;
	return function () {
		Timer.ticks++;
		Timer.fn.apply(Timer);
		Timer.lastTick = now();

		if (Timer.ticks === Timer.maxTicks) {
			Timer.stop();
		}
	};
};

Timer.prototype.start = function () {
	this.startTime = this.lastTick = now();
	this.id = setInterval(this.tick(), this.interval);
	return true;
};

Timer.prototype.resume = function () {
	if (this.timeLeft) {
		this.id = setInterval(this.tick(), this.timeLeft);
		delete this.timeLeft;
		return true;
	}

	return false;
};

Timer.prototype.pause = function () {
	if (this.id) {
		this.timeLeft = this.interval - (now() - this.lastTick);
		this.kill();
		return true;
	}

	return false;
};

Timer.prototype.reset = function () {
	if (!!this.startTime) {
		this.startTime = now();
		this.ticks = 1; // ticks are set to 1 because we're about to execute the first tick again
		return true;
	} else {
		return false;
	}
};

Timer.prototype.kill = function () {
	if (this.id) {
		clearInterval(this.id);
		delete this.id;
		return true;
	}

	return false;
};

Timer.prototype.stop = function () {
	if (this.id || this.timeLeft) {
		this.ticks = 0;
		this.kill();
		delete this.timeLeft;
		return true;
	}

	return false;
};

function Timers() {
	if (!(this instanceof Timers)) {
		return new Timers();
	}

	var scope = this;
	this.timers = [];

	function all(method) {
		return function () {
			var j = scope.timers.length;

			for (var i = 0; i < j; i++) {
				scope.timers[i][method]();
			}
		};
	}

	function hasExecutionPaused(fn) {
		return function () {
			var Timer = this,
			    time = now() - Timer.lastTick - Timer.interval,
			    threshhold = Timer.interval * 1.5;

			if (threshhold < time) {
				Timer.reset();
			}

			fn.apply(Timer);
		};
	}

	function create(interval, fn, maxTicks, opts) {
		if (opts && opts.reset) {
			fn = hasExecutionPaused(fn);
		}

		var timer = new Timer(interval, fn, maxTicks, opts);
		scope.timers.push(timer);
		return timer;
	}

	return {
		create: create,
		resumeall: all('resume'),
		pauseall: all('pause'),
		stopall: all('stop')
	};
}

module.exports = Timers;

},{}],107:[function(require,module,exports){
/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@ft.com
 */

'use strict';

module.exports = {
	artifactVersion: '${project.version}',
	buildLifeId: '${buildLifeId}',
	buildLifeDate: '${buildLifeDate}',
	gitRev: '${buildNumber}',
	toString: function toString() {
		return ' version: ' + this.artifactVersion + ' Build life id: ' + this.buildLifeId + ' Build date: ' + this.buildLifeDate + ' git revision: ' + this.gitRev;
	}
};

},{}],108:[function(require,module,exports){
/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 */
/**
 * FT.ads.video.miniplayer is...
 * @name video-miniplayer
 * @memberof FT.ads
*/
'use strict';

var config = require('./config');
var targeting = require('./targeting');

function buildURLForVideo(zone, pos, vidKV) {
	var krux = config('krux') || {};
	var gpt = config('gpt') || {};
	pos = pos || 'video';
	vidKV = vidKV || {};
	var gptVideoURL = function gptVideoURL() {
		var URL, additionalAdTargetingParams, fullURL;
		var buildCustomParams = function buildCustomParams(vkv) {
			var i;
			var allTargeting = targeting.get();
			var results = '';
			var kruxSegs = allTargeting.ksg;
			var includeParams = ['playlistid', 'playerid', '07', 'ksg', 'kuid', 'khost', '06', 'slv', 'eid', '05', '19', '21', '27', '20', '02', '14', 'cn', '01', 'rfrsh', 'dcopt', 'brand', 'section', 'lnID', 'specialBadging'];

			for (i = 0; i < includeParams.length; i++) {
				var key = includeParams[i];
				var value = false;
				if (typeof allTargeting[key] !== 'undefined') {
					value = allTargeting[key];
				} else if (typeof vkv !== 'undefined' && typeof vkv[key] !== 'undefined') {
					value = vkv[key];
				}

				if (key === 'ksg' && kruxSegs) {
					var max = krux.limit || 1e4;
					value = kruxSegs.slice(0, max).join(',');
				}

				results += !value ? '' : key + '=' + value + '&';
			}

			return results;
		};

		var encodeCustParams = function encodeCustParams(vkv) {
			return encodeURIComponent(buildCustomParams(vkv));
		};

		URL = 'http://pubads.g.doubleclick.net/gampad/ads?env=vp&gdfp_req=1&impl=s&output=xml_vast2&iu=/5887/' + gpt.site + '/' + gpt.zone + '&sz=592x333|400x225&unviewed_position_start=1&scp=pos%3D' + pos;
		additionalAdTargetingParams = encodeCustParams(vidKV);
		fullURL = buildCustomParams(vidKV) === '' ? URL : URL + '&' + buildCustomParams(vidKV);
		return {
			urlStem: URL,
			additionalAdTargetingParams: additionalAdTargetingParams,
			fullURL: fullURL
		};
	};

	return gptVideoURL();
}

module.exports = buildURLForVideo;

module.exports.debug = function () {
	var utils = require('./utils');
	var log = utils.log;

	log.start('Video');
	log.attributeTable(buildURLForVideo());
	log.end();
};

},{"./config":90,"./targeting":98,"./utils":101}],109:[function(require,module,exports){
'use strict';

var oViewport = require("./../o-viewport/main.js");
var TrackedElement = require('./src/tracked-element');

var tracked = [];
var tracking = false;
var bodyHeight = 0;

/*
* begin tracking an element
*/
function track(element) {
	var exists = tracked.filter(sameElement(element));
	if (exists.length) {
		element = exists[0];
	} else {
		element = new TrackedElement(element);
		tracked.push(element);
		element.update();
		initEvents();
	}

	return element;
}

/*
* Provides a test for matching elements
*/
function sameElement(element) {
	return function (item) {
		return item.node === element;
	};
}

/*
* Call the update method on all tracked elements
*/
function update(force) {
	force = force === true ? true : false;
	tracked.forEach(function (element) {
		element.update(force);
	});
}

/*
* Call the updatePositions method on all tracked elements
*/
function updatePositions(force) {
	force = force === true ? true : false;
	tracked.forEach(function (element) {
		element.updatePosition().update(force);
	});
}

/*
* Call the updateScrollHandler method when scrolling
*/
function updateScrollHandler() {
	if (bodyHeight !== document.body.clientHeight) {
		bodyHeight = document.body.clientHeight;
		updatePositions();
	}
	update();
}

/*
* initialise
*/
function init(selector) {
	var elements = [];
	selector = typeof selector === 'string' ? selector : '[data-o-element-visibility-track]';

	try {
		elements = document.querySelectorAll(selector);
	} catch (err) {
		return;
	}

	if (elements.length) {
		[].slice.call(elements).forEach(track);
		update();
	}

	initEvents();
	bodyHeight = document.body.clientHeight;
	document.documentElement.removeEventListener('o.DOMContentLoaded', init);
}

function destroy() {
	tracked.length = 0;
	if (tracking === true) {
		document.body.removeEventListener('oViewport.orientation', updatePositions);
		document.body.removeEventListener('oViewport.resize', updatePositions);
		document.body.removeEventListener('oViewport.scroll', updateScrollHandler);
		document.body.removeEventListener('oViewport.visibility', update);
		tracking = false;
	}
}

function initEvents() {
	if (tracking === false) {
		oViewport.listenTo('all');
		document.body.addEventListener('oViewport.orientation', updatePositions);
		document.body.addEventListener('oViewport.resize', updatePositions);
		document.body.addEventListener('oViewport.scroll', updateScrollHandler);
		document.body.addEventListener('oViewport.visibility', update);
		tracking = true;
	}
}

document.documentElement.addEventListener('o.DOMContentLoaded', init);

module.exports = {
	track: track,
	tracked: tracked,
	updatePositions: updatePositions,
	update: update,
	init: init,
	destroy: destroy
};

},{"./../o-viewport/main.js":133,"./src/tracked-element":110}],110:[function(require,module,exports){
'use strict';

var oviewport = require("./../../o-viewport/main.js");

/*
* Represents a tracked element
*/
function TrackedElement(node) {
	if (!(this instanceof TrackedElement)) {
		return new TrackedElement(node);
	}

	this.node = node;
	this.updatePosition();
}

/*
* Update the current visibility status of a tracked element
*/
TrackedElement.prototype.update = function (force) {
	this.inViewport().percentInViewport();

	var type = this.lastResult !== this.inview ? 'visibility' : this.lastPercentage !== this.percentage ? 'percentage' : force ? 'update' : false;

	if (type) {
		broadcast('inview', {
			element: this,
			type: type,
			inviewport: this.inview,
			percentage: this.percentage
		}, this.node);
	}

	return this;
};

/*
* get the current absolute position of the element in the document
*/
TrackedElement.prototype.updatePosition = function () {
	var rect = this.node.getBoundingClientRect();
	var scroll = oviewport.getScrollPosition();
	var width = this.width = rect.width;
	var height = this.height = rect.height;
	var top = this.top = scroll.top + rect.top;
	var left = this.left = scroll.left + rect.left;
	this.bottom = top + height;
	this.right = left + width;
	this.area = width * height;
	return this;
};

/*
* Check if the element is in the viewport
*/
TrackedElement.prototype.inViewport = function () {
	this.lastInview = this.inview || false;
	var scrollPos = oviewport.getScrollPosition();
	var viewportDims = oviewport.getSize();
	var viewport = {
		top: scrollPos.top,
		left: scrollPos.left,
		bottom: scrollPos.top + viewportDims.height,
		right: scrollPos.left + viewportDims.width
	};

	this.inview =

	// is in viewport vertically
	(this.top >= viewport.top && this.top < viewport.bottom || this.bottom > viewport.top && this.bottom <= viewport.bottom) && (

	// is in viewport horizontally
	this.left >= viewport.left && this.left < viewport.right || this.right > viewport.left && this.right <= viewport.right);
	return this;
};

/*
* Get the percentage of the element in the viewport
*/
TrackedElement.prototype.percentInViewport = function () {
	this.lastPercentage = this.percentage || 0;

	var viewport = oviewport.getSize();
	var scroll = oviewport.getScrollPosition();
	var inViewWidth = Math.min(this.right, scroll.left + viewport.width) - Math.max(this.left, scroll.left);
	var inViewHeight = Math.min(this.bottom, scroll.top + viewport.height) - Math.max(this.top, scroll.top);
	var percentage = inViewWidth * inViewHeight / (this.area / 100);
	this.percentage = inViewHeight > 0 && inViewWidth > 0 && percentage > 0 ? Math.round(percentage) : 0;
	return this;
};

function broadcast(eventType, data, target) {
	target = target || document.body;

	target.dispatchEvent(new CustomEvent('oVisibility.' + eventType, {
		detail: data,
		bubbles: true
	}));
}

module.exports = TrackedElement;

},{"./../../o-viewport/main.js":133}],111:[function(require,module,exports){
'use strict';

/**
 * The oErrors error tracking and reporting module.
 *
 * @module oErrors
 * @see Errors
 */
var Errors = require('./src/js/oErrors');
var errors = new Errors();

function initialise() {
  errors.init();
  document.removeEventListener('o.DOMContentLoaded', initialise);
}

// Try and initialise on o.DOMContentLoaded. If it fails, defer to the
// consumer of the library.
document.addEventListener('o.DOMContentLoaded', initialise);

/**
 * A constructed object, this module is a Singleton due to the architecture of
 * Raven JS. See {@link Errors} for the publicly available interface.
 *
 * @type {Errors}
 */
module.exports = errors;

},{"./src/js/oErrors":113}],112:[function(require,module,exports){
"use strict";

/* global console */

/**
 * Create a new Logger class. Used internally by {@link Errors}.
 *
 * @param {Number} logSize - The default, fixed size of the log buffer.
 * @param {String} logLevel - The default log level, see the enumeration {@link Logger.level} for valid values, expects a String corresponding to a log level name.
 * @class Logger
 */
function Logger(logSize, logLevel) {
	this._logBuffer = new Array(logSize);
	this._nextLogIndex = 0;

	// const
	this._logLevel = Logger.level[logLevel];

	this.enabled = this._logLevel !== Logger.level.off;
	if (!this.enabled) {
		this._consoleLog = noop;
	}

	var out = console || window.console || { log: noop, warn: noop, error: noop };
	this.out = out;
}

Logger.prototype.error = function () {
	this._consoleLog("ERROR", this.out.error, arguments);
};

Logger.prototype.log = function () {
	this._consoleLog("LOG", this.out.log, arguments);
};

Logger.prototype.warn = function () {
	this._consoleLog("WARN", this.out.warn, arguments);
};

Logger.prototype._consoleLog = function (name, consoleMethod, args) {
	var debug = this._logLevel === Logger.level.debug || this._logLevel === Logger.level.consoleonly;

	// Because 'arguments' is not a true array we call out to argsAsLogString
	// to efficiently concatenate the arguments as string types to create the
	// message.
	var message = argsAsLogString(name, args);
	this.append(message);

	if (debug && consoleMethod) {
		consoleMethod.apply(this.out, args);
	}
};

function argsAsLogString(logName, args) {
	var string = logName + ":";

	// TODO: Improve the logging of objects.  We could 'require('util')' and
	// use util.format (provided by browserify), but it adds 8K to the
	// minified output, it doesn't seem worth it. Kornel suggests
	// git.svc.ft.com/projects/LOG/repos/js-abbreviate/browse
	for (var index = 0; index < args.length; index++) {
		string += " " + args[index];
	}

	return string;
}

Logger.prototype.append = function (logLine) {
	this._logBuffer[this._nextLogIndex] = logLine;

	// Really simple Ring buffer implementation (keep track of next insertion
	// location)
	this._nextLogIndex++;
	if (this._nextLogIndex === this._logBuffer.length) {
		this._nextLogIndex = 0;
	}
};

/**
 * Roll the log buffer into a new line delimited string starting.
 * It, creates a chronological log based on the contents of the current
 * buffer. Any log entries that are undefined are dropped.
 *
 * @private
 * @returns {String} - Rolled up string
 */
Logger.prototype.logLines = function () {
	var index = this._nextLogIndex;
	var nextLogIndex = this._nextLogIndex;
	var rolledUpLogs = [];

	do {
		var logEntry = this._logBuffer[index];

		if (logEntry !== undefined) {
			rolledUpLogs.push(this._logBuffer[index]);
		}

		index++;

		if (index >= this._logBuffer.length) {
			index = 0;
		}
	} while (index !== nextLogIndex);

	return rolledUpLogs.join("\n");
};

/**
 * Describes the logging levels available
 * @enum {Number}
 * @public
 */
Logger.level = {
	/**
  * No logging at all occurs, each call to errors.log or errors.log are no-ops
  */
	off: 0,

	/**
  * Logs are stored in a buffer, by default the last 10 lines.  When an
  *  error occurs, these log lines are attached to the error object.
  */
	contextonly: 1,

	/**
  * Logs are stored in the buffer as with `contextonly` however, they are
  * also passed through to the relevant `console.*` API.
  */
	debug: 2, // contextonly & debug

	/**
  * Logging only occurs in the console. Raven client is not initialised.
  */
	consoleonly: 3
};

function noop() {}

module.exports = Logger;

},{}],113:[function(require,module,exports){
'use strict';

var Logger = require('./logger');

function isFunction(fn) {
	return typeof fn === 'function';
}

function throwLater(error) {
	// Throw the error on the main event loop rather than in this
	// context so that the error can be surfaced to the developer
	// without halting the current context.
	setTimeout(function oErrorsError() {
		throw error;
	}, 0);
}

/**
 * @class Errors
 */
function Errors() {
	// Initialises raven client with noops for consoleonly logging level
	this.ravenClient = null;

	/**
  * The initialised state of the object.
  * @type {bool}
  */
	this.initialised = false;

	this.logger = null;
	this._logEventHandler = this.handleLogEvent.bind(this);

	// While not initialised, any caught errors are buffered.
	this._errorBuffer = [];

	// Cache the declarative config String to avoid reading the DOM more than
	// once, once initialised, the reference to the string is released for GC.
	this._declarativeConfigString = false;

	// noop operations
	this._filterError = function () {
		return true;
	};
	this._transformError = function (data) {
		return data;
	};
}

/**
 * Initialises the Error object with a Raven dependency.
 *
 * All options are optional, if a configuration option is missing, the module
 * will try to initialise using any configuration found in the DOM using the
 * script config tag.
 *
 * @example
 * <!-- DOM configuration settings -->
 * <script type="application/json" data-o-errors-config>
 * {
 *   "sentryEndpoint": "https://dsn@app.getsentry.com/123"
 * }
 * </script>
 *
 * @param {Object} options                 - Optional, configuration options object
 * @param {string} options.sentryEndpoint  - Optional if configued via the DOM, Required if not, must be a valid {@link https://app.getsentry.com/docs/platforms/|Sentry DSN}.
 * @param {string} options.siteVersion     - Optional, optionally the version of the code the page is running. This tags each error with the code version
 * @param {string} options.logLevel        - Optional, see {@link Logger.level} for valid names
 * @param {boolean} options.disabled       - Optional, If `true`, disable o-errors reporting.
 * @param {Array} options.buffer           - Optional, pre-existing buffer of error events to flush.
 * @param {Object} raven                   - The Raven JS client object.
 * @returns {Errors}  - The Errors instance
 */
Errors.prototype.init = function (options, raven) {
	if (this.initialised) {
		return this;
	}

	var hasDeclarativeConfig = this._hasDeclarativeConfig();
	var configMissing = !(hasDeclarativeConfig || options);

	// In main.js an event listener is bound to 'o.DOMContentLoaded', this
	// calls 'init' without arguments with the intention of configuring from
	// the declarative config if it exists.  If the declarative markup doesn't
	// exist, we do nothing so that the consumer has the option of
	// configuring imperatively by calling `init` with options themselves.
	if (configMissing) {
		return this;
	}

	options = options || {};

	if (hasDeclarativeConfig) {
		options = this._initialiseDeclaratively(options);

		if (options.filterError) {
			options.filterError = undefined;
			throwLater(new Error("Can not configure 'oErrors' with `filterError` using declarative markup - error filtering will not be enabled"));
		}

		if (options.transformError) {
			options.transformError = undefined;
			throwLater(new Error("Can not configure 'oErrors' with `transformError` using declarative markup - error transforming will not be enabled"));
		}

		if (options.transportFunction) {
			options.transportFunction = undefined;
			throwLater(new Error("Can not configure 'oErrors' with `transportFunction` using declarative markup - overriding Sentry's transport function will not be enabled"));
		}
	}

	if (isFunction(options.transformError)) {
		this._transformError = options.transformError;
	}

	if (isFunction(options.filterError)) {
		this._filterError = options.filterError;
	}

	if (Array.isArray(options.errorBuffer) && options.errorBuffer.length > 0) {
		this._errorBuffer = this._errorBuffer.concat(options.errorBuffer);
	}

	// If errors is configured to be disabled, (options.disabled = true),
	// then stub this.report, turn off logging (which turns them into noops),
	// and return 'initialised' before installing raven.
	var isErrorsDisabled = options.enabled === undefined ? false : options.enabled === false;

	var logLevel = isErrorsDisabled ? Logger.off : options.logLevel;
	var defaultLogLength = 10;
	this.logger = new Logger(defaultLogLength, logLevel);

	if (isErrorsDisabled) {
		this.report = function (error) {
			return error;
		};
		this.wrapWithContext = function (fn) {
			return fn;
		};
		this.initialised = true;
		return this;
	}

	if (!options.sentryEndpoint) {
		throw new Error('Could not initialise o-errors: Sentry endpoint and auth configuration missing.');
	}

	// Only install Raven if not using console only logging level
	if (Logger.level[logLevel] !== Logger.level.consoleonly) {
		this._configureAndInstallRaven(options, raven);
	} else {
		this.ravenClient = {
			captureException: function captureException() {},
			uninstall: function uninstall() {}
		};
	}

	document.addEventListener('oErrors.log', this._logEventHandler);

	this.initialised = true;

	this._flushBufferedErrors();
	return this;
};

Errors.prototype._configureAndInstallRaven = function (options, raven) {

	// To control the initialisation of the third party code (Raven)
	// we include it only at init time see "http://origami.ft.com/docs/syntax/js/#initialisation"
	//
	// It is optional so that it can be mocked in tests
	if (!(raven || this.ravenClient)) {
		raven = require("./../../../raven-js/dist/raven.js");
	}

	this.ravenClient = raven;

	var sentryEndpoint = options.sentryEndpoint;
	var updatePayloadBeforeSend = this._updatePayloadBeforeSend.bind(this);

	var ravenOptions = {
		dataCallback: updatePayloadBeforeSend
	};

	if (options.siteVersion) {
		ravenOptions.release = options.siteVersion;
	}

	if (options.tags) {
		ravenOptions.tags = options.tags;
	}

	if (isFunction(options.transportFunction)) {
		ravenOptions.transport = options.transportFunction;
	}

	this.ravenClient.config(sentryEndpoint, ravenOptions);
	this.ravenClient.install();
};

/**
 * Flush any errors that are buffered in `this._errorBuffer`.
 * @private
 *
 * @returns {undefined} - undefined
 */
Errors.prototype._flushBufferedErrors = function () {
	if (!this.initialised) {
		return;
	}

	var errors = this;
	this._errorBuffer.forEach(function (bufferedError) {
		errors.report(bufferedError.error, bufferedError.context);
	});

	// Clear the buffer, deleting references we hold to any buffered errors
	this._errorBuffer = [];
};

/**
 * Report an Error object to the error aggregator.

 * @example
 * // Reports a caught Error generated by the Promise
 * fetch('example.com').then(doSomething).catch(oErrors.report);
 *
 * @example
 * // Reports and re-throws the caught error
 * try {
 *   doSomething();
 * } catch(e) {
 *   throw oErrors.report(e);
 * }
 *
 * @param {Error}  error    - The error object to report.
 * @param {Object} context  - Optional context to attach to the Error in the
 *                            aggregator
 * @return {Error} - The passed in error
 */
Errors.prototype.report = function (error, context) {
	var _context = context || {};
	var reportObject = { error: error, context: _context };

	if (!this.initialised) {
		this._errorBuffer.push(reportObject);
		return error;
	}

	var transformedError = this._transformError(reportObject);

	// The _transformError may return a bad value, in order to protect against
	// this mistake and still report a valid object we test the return value
	// before continuing to use it
	if (transformedError && transformedError.error) {
		reportObject = transformedError;
	}

	if (!reportObject.context) {
		reportObject.context = {};
	}

	if (!this._filterError(reportObject)) {
		return error;
	}

	// Raven, for some reason completely ignores the contents of
	// error.message... to get around this, we attach the error message to the
	// context object.
	if (reportObject.error.message) {
		reportObject.context.errormessage = reportObject.error.message;
	}

	this.ravenClient.captureException(reportObject.error, reportObject.context);
	return error;
};

/**
 * Log an 'ERROR' level log. Intended to have the same semantics as
 * console.error.
 *
 * This.stores the log in memory and will attach the last `n` log lines to the
 * context of any reported errors.  See {@link Errors#log} to log a log
 * message.
 *
 *
 * @param {String}  message - The message to log
 * @returns {undefined} - undefined
 */
Errors.prototype.error = function () {
	this.logger.error.apply(this.logger, arguments);
};

/**
 * Log a 'WARN' level log.  Intended to have the same semantics as
 * console.warn.
 * This stores the log in memory and will attach the last `n` log lines to the
 * context of the error. See {@link Errors#log} to log a log message.
 *
 * @param {String} warnMessage  - The message to log.
 * @returns {undefined} - undefined
 */
Errors.prototype.warn = function () {
	this.logger.warn.apply(this.logger, arguments);
};

/**
 * Log a 'LOG' level log.  Intended to have the same semantics as console.log.
 * This stores the log in memory and will attach the last `n` log lines to the
 * context of the error.  See {@link Errors#warn} to log a warn message.
 *
 * @param {String} logMessage - The message to log.
 * @returns {undefined} - undefined
 */
Errors.prototype.log = function () {
	this.logger.log.apply(this.logger, arguments);
};

/**
 * Wrap a function so that any uncaught errors are caught and reported to the
 * error aggregator.
 *
 * @example
 * // Wraps function, any errors occurring within the function are caught, logged, and rethrown.
 * let wrappedFunction = oErrors.wrap(function() {
 *   throw new Error("My Error");
 * });
 *
 * If you want to attach additional contextual information to the error, see
 * {@link Errors#wrapWithContext}.
 -
 * @param {Function} fn     - The function to wrap.
 * @return {Function} - Wrapped function
 */
Errors.prototype.wrap = function (fn) {
	return this.wrapWithContext({}, fn);
};

/**
 * Wrap a function so that any uncaught errors are caught and reported to the error
 * aggregator.
 * This method allows additional context to be attached to the error if it
 * occurs.
 *
 * @example
 * // Wrap a function with some additional context to be reported in the event
 * // `doSomethingCallback` throws an error.
 * setTimeout(oErrors.wrapWithContext({ "context:url": "example.com" }, doSomethingCallback), 1000);
 *
 * @param {Object}   context     - Additional context to report along with the error
 *                                 if the function `fn` throws an Error.
 * @param {Function} fn          - The function to wrap
 * @return {Function} - Wrapped function with context
 */
Errors.prototype.wrapWithContext = function (context, fn) {
	var errors = this;
	return function () {
		try {
			return fn.apply(undefined, arguments);
		} catch (e) {
			errors.report(e, context);
			throw e;
		}
	};
};

/**
 * Remove the `oErrors.log` event listener and clean up as much of the Raven
 * client as possible.
 *
 * Errors is unusable after a call to destroy and calling `init` subsequently
 * will fail.
 *
 * @returns {undefined} - undefined
 */
Errors.prototype.destroy = function () {
	if (!this.initialised) {
		return;
	}
	document.removeEventListener('oErrors.log', this._logEventHandler);
	this.ravenClient.uninstall();
};

Errors.prototype.handleLogEvent = function (ev) {
	// If no event is passed here, return early
	if (!ev) {
		return;
	}

	// Tag the context with additional information about the DOM.
	var context = {
		info: ev.detail.info || {},
		extra: {
			"context:dom": this._getEventPath(ev).reduceRight(function (builder, el) {
				var classList = Array.prototype.slice.call(el.classList || []);

				if (!el.nodeName) {
					return builder + " - " + el.constructor.name + "\n";
				}

				var nodeName = el.nodeName.toLowerCase();

				if (nodeName.indexOf('#') === 0) {
					return builder + "<" + nodeName + ">\n";
				}

				return builder + "<" + el.nodeName.toLowerCase() + " class='" + classList.join(' ') + "' id='" + (el.id || '') + "'>\n";
			}, "")
		}
	};
	this.report(ev.detail.error, context);
};

/**
 * Given a DOM event, return an ordered array of Elements that the event will propagate
 * through.
 *
 * @private
 * @param {Event} event - The event to get the path for.
 * @returns {Array} - An array of Elements.
 */
Errors.prototype._getEventPath = function (event) {
	var path = [];

	// IE backwards compatibility (get the actual target). If IE, uses
	// `window.event.srcElement`
	var element = event.target || window.event.srcElement;

	while (element) {
		path.push(element);
		element = element.parentElement;
	}

	return path;
};

/**
 * A hook to add additional data to the payload before sending.
 *
 * @private
 * @param {Object} data - The data object from Raven
 * @returns {Object} - Updated data
 */
Errors.prototype._updatePayloadBeforeSend = function (data) {
	if (this.logger.enabled) {
		data.extra["context:log"] = this.logger.logLines();
	}
	return data;
};

/**
 * Get whether declarative configuration exists in the DOM.
 *
 * @private
 * @returns {boolean} - Boolean value indicating if there's declarative config
 */
Errors.prototype._hasDeclarativeConfig = function () {
	return !!this._getDeclarativeConfig();
};

/**
 * Get the configuration as a String.
 *
 * @private
 * @returns {string} - Stringified configuration
 */
Errors.prototype._getDeclarativeConfig = function () {
	if (!this._declarativeConfigString) {
		var config = document.querySelector('script[data-o-errors-config]');
		if (config) {
			this._declarativeConfigString = config.textContent || config.innerText || config.innerHTML;
		} else {
			return false;
		}
	}

	return this._declarativeConfigString;
};

/**
 * Initialises additional data using the <script type="application/json" data-o-errors-config> element in the DOM.
 *
 * @private
 * @param {Object} options - A partially, or fully filled options object.  If
 *                           an option is missing, this method will attempt to
 *                           initialise it from the DOM.
 * @returns {Object} - The options modified to include the options gathered
 *                     from the DOM
 */
Errors.prototype._initialiseDeclaratively = function (options) {

	if (!this._hasDeclarativeConfig()) {
		return false;
	}

	var declarativeOptions = undefined;

	try {
		declarativeOptions = JSON.parse(this._getDeclarativeConfig());
	} catch (e) {
		throw new Error("Invalid JSON configuration syntax, check validity for o-errors configuration: '" + e.message + "'");
	}

	for (var property in declarativeOptions) {
		if (declarativeOptions.hasOwnProperty(property)) {
			options[property] = options[property] || declarativeOptions[property];
		}
	}

	// Release the reference to the config string
	this._declarativeConfigString = false;
	return options;
};

module.exports = Errors;

},{"./../../../raven-js/dist/raven.js":135,"./logger":112}],114:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*global module*/

/**
 * Detect IE 8 through injected conditional comments:
 * no UA detection, no need for conditional compilation or JS check
 * @return {Bool} true if the browser is IE 8
 */
var isIE8 = (function () {
	var b = document.createElement('B');
	var docElem = document.documentElement;
	var isIE = undefined;

	b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
	docElem.appendChild(b);
	isIE = !!document.getElementById('ie8test');
	docElem.removeChild(b);
	return isIE;
})();

/**
 * Grab grid properties surfaced in html:after's content
 * @return {Object} layout names and gutter widths
 */
function getGridProperties() {
	// Contained in a try/catch as it should not error if o-grid styles are not (deliberately or accidentally) loaded
	// e.g. o-tracking will always try to read this property, but the page is not obliged to use o-grid for layout
	try {
		var gridProperties = window.getComputedStyle(document.documentElement, ':after').getPropertyValue('content');
		// Firefox computes: "{\"foo\": \"bar\"}"
		// We want readable JSON: {"foo": "bar"}
		gridProperties = gridProperties.replace(/'/g, '').replace(/\\/g, '').replace(/^"/, '').replace(/"$/, '');
		return JSON.parse(gridProperties);
	} catch (e) {
		return {};
	}
}

/**
 * Grab the current layout
 * @return {String} Layout name
 */
function getCurrentLayout() {
	if (isIE8) {
		return 'L';
	}

	return getGridProperties().layout;
}

/**
 * Grab the current space between columns
 * @return {String} Gutter width in pixels
 */
function getCurrentGutter() {
	if (isIE8) {
		return '20px';
	}

	return getGridProperties().gutter;
}

exports.default = {
	getCurrentLayout: getCurrentLayout,
	getCurrentGutter: getCurrentGutter
};

},{}],115:[function(require,module,exports){
/* globals DocumentTouch */
'use strict';

function Hoverable() {

	var hasContact = false;
	var contactlessMoves = 0;
	var lastClientX;
	var lastClientY;
	var eventmap = [['touchstart', contactStart], ['mousedown', contactStart], ['mspointerdown', contactStart], ['touchend', contactEnd], ['mouseup', contactEnd], ['mspointerup', contactEnd], ['mousemove', contactMove], ['mspointerhover', contactMove]];
	var className = 'o-hoverable-on';
	var htmlClassList;

	function init() {
		window.document.documentElement.setAttribute('data-o-hoverable--js', '');
		touchSupport();
	}

	// If HTML has hover effects enabled, and device appears to support touch
	// remove hover effects and start listening for pointer interactions
	function touchSupport() {
		htmlClassList = window.document.documentElement.classList;

		if (classExists() && ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch)) {
			htmlClassList.remove(className);

			eventmap.forEach(function (item) {
				listener('add', item[0], item[1]);
			});
		}
	}

	function contactStart(event) {
		hasContact = true;
		contactlessMoves = 0;
	}

	function contactEnd(event) {
		hasContact = false;
	}

	// If a contactless move (ie a hover) is detected, turn hover effects back on
	function contactMove(event) {
		if (!hasContact) {
			contactlessMoves++;
		}

		if ('mousemove' === event.type.toLowerCase()) {

			// COMPLEX:GC:20130322: Webkit can fire an erroneous mousemove under some conditions, so
			// keep a track of the clientX and clientY values, and reject events where these values don't change.
			if (lastClientX === event.clientX && lastClientY === event.clientY) {
				return;
			}
			lastClientX = event.clientX;
			lastClientY = event.clientY;
		}

		// MSPointerHover categorically means a contactless interaction
		if (contactlessMoves > 1 || event.type.toLowerCase() === 'mspointerhover') {
			htmlClassList.add(className);

			eventmap.forEach(function (item) {
				listener('remove', item[0], item[1]);
			});
		}
	}

	function listener(type, event, fn) {
		window[type + 'EventListener'](event, fn, false);
	}

	function classExists() {
		return htmlClassList.contains(className);
	}

	function destroy() {
		window.document.documentElement.removeAttribute('data-o-hoverable--js');

		eventmap.forEach(function (item) {
			listener('remove', item[0], item[1]);
		});
	}

	init();

	return {
		setClassName: function setClassName(str) {
			className = str;
			touchSupport();
		},
		destroy: destroy,
		isHoverEnabled: classExists
	};
}

Hoverable.init = function () {
	if (!window.document.documentElement.hasAttribute('data-o-hoverable--js')) {
		document.removeEventListener('o.DOMContentLoaded', Hoverable.init);
		return new Hoverable();
	}
};

document.addEventListener('o.DOMContentLoaded', Hoverable.init);

module.exports = Hoverable;

},{}],116:[function(require,module,exports){
/*global require, module */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var settings = require('./src/javascript/core/settings');
var user = require('./src/javascript/core/user');
var session = require('./src/javascript/core/session');
var send = require('./src/javascript/core/send');

/**
 * The version of the tracking module.
 * @type {string}
 */
var version = '1.1.8';
/**
 * The source of this event.
 * @type {string}
 */
var source = 'o-tracking';
/**
 * The API key.
 * @type {string}
 */
var api_key = 'qUb9maKfKbtpRsdp0p2J7uWxRPGJEP';

/**
 * @class Tracking
 */
function Tracking() {
	this.version = version;
	this.source = source;
	this.api_key = api_key;

	/**
  * The initialised state of the object.
  * @type {boolean}
  */
	this.initialised = false;
}

/**
 * Turn on/off developer mode. (Can also be activated on init.)
 * @param {boolean} level - Turn on or off, defaults to false if omitted.
 * @return {undefined}
 */
Tracking.prototype.developer = function (level) {
	if (level) {
		settings.set('developer', true);
	} else {
		settings.destroy('developer', null);
		settings.destroy('no_send', null);
	}
};

/**
 * Clean up the tracking module.
 * @return {undefined}
 */
Tracking.prototype.destroy = function () {
	this.developer(false);
	this.initialised = false;

	settings.destroy('config');
	settings.destroy('page_sent');
};

/**
 * Overload toString method to show the version.
 * @return {string} The module's version.
 */
Tracking.prototype.toString = function () {
	return 'oTracking version ' + version;
};

Tracking.prototype.page = require('./src/javascript/events/page-view');

Tracking.prototype.event = require('./src/javascript/events/custom');

Tracking.prototype.link = require('./src/javascript/events/link-click');

Tracking.prototype.utils = require('./src/javascript/utils');

/**
 * Initialises the Tracking object.
 *
 * All options are optional, if a configuration option is missing, the module
 * will try to initialise using any configuration found in the DOM using the
 * script config tag.
 *
 * @example
 * <!-- DOM configuration settings -->
 * <script type='application/json' data-o-tracking-config>
 * page: {
 * 	 product: 'desktop'
 * },
 * user: {
 *   user_id: '023ur9jfokwenvcklwnfiwhfoi324'
 * }
 * </script>
 *
 * @param {Object} config 					- See {@link Tracking} for the configuration options.
 * @param {boolean} config.developer        - Optional, if `true`, logs certain actions.
 * @param {boolean} config.noSend           - Optional, if `true`, won't send events.
 * @param {string} config.configId          - Optional
 * @param {string} config.session           - Optional
 *
 * @return {Tracking} - Returns the tracking object
 */
Tracking.prototype.init = function (config) {
	if (this.initialised) {
		return this;
	}

	var hasDeclarativeConfig = !!this._getDeclarativeConfigElement();

	if (!(hasDeclarativeConfig || config)) {
		return this;
	}

	config = config || {};
	if (hasDeclarativeConfig) {
		config = this._getDeclarativeConfig(config);
	}

	settings.set('config', config);
	settings.set('version', this.version);
	settings.set('source', this.source);
	settings.set('api_key', this.api_key);

	settings.set('page_sent', false);

	// Developer mode
	if (config.developer) {
		this.developer(config.developer);

		if (config.noSend) {
			settings.set('no_send', true);
		}
	}

	// User identifier
	user.init(config.user ? config.user.user_id : null);

	// Session
	session.init(config.session);

	// Initialize the sending queue.
	var queue = send.init();

	// If queue length is very large, could be due to a bug in a previous version
	// This was fixed in 1.0.14 https://github.com/Financial-Times/o-tracking/compare/1.0.13...1.0.14
	// But, still seeing big queues coming through in the data for historical reasons.
	// This tries to catch those big queues and forcibly empty them.
	var queue_length = queue.all().length;

	if (queue_length > 200) {
		queue.replace([]);

		this.event({ detail: {
				category: 'o-tracking',
				action: 'queue-bug',
				context: {
					queue_length: queue_length
				}
			} });
	}
	this.event.init();
	this.page.init();
	this.initialised = true;
	return this;
};

/**
 * Checks if the <script type='application/json' data-o-tracking-config> element is in the DOM
 * @private
 * @return {HTMLElement} - Returns the <script> element if found
 */
Tracking.prototype._getDeclarativeConfigElement = function () {
	return document.querySelector('script[data-o-tracking-config]');
};

/**
 * Initialises additional data using the <script type='application/json' data-o-tracking-config> element in the DOM.
 * @private
 * @param {Object} options - A partially, or fully filled options object.  If
 *                           an option is missing, this method will attempt to
 *                           initialise it from the DOM.
 * @return {Object} - The options modified to include the options gathered from the DOM
 */
Tracking.prototype._getDeclarativeConfig = function (options) {
	var configEl = this._getDeclarativeConfigElement();
	var declarativeConfigString = undefined;
	if (configEl) {
		declarativeConfigString = configEl.textContent || configEl.innerText || configEl.innerHTML;
	} else {
		return false;
	}

	var declarativeOptions = undefined;

	try {
		declarativeOptions = JSON.parse(declarativeConfigString);
	} catch (e) {
		var configError = new Error('Invalid JSON configuration syntax, check validity for o-tracking configuration: "' + e.message + '"');
		this.utils.broadcast('oErrors', 'log', {
			error: configError.message,
			info: { module: 'o-tracking' }
		});
		throw configError;
	}

	for (var property in declarativeOptions) {
		if (declarativeOptions.hasOwnProperty(property)) {
			options[property] = options[property] || declarativeOptions[property];
		}
	}

	return options;
};

var tracking = new Tracking();

function initialise() {
	tracking.init();
	document.removeEventListener('o.DOMContentLoaded', initialise);
}

// Try and initialise on o.DOMContentLoaded. If it fails, defer to the
// consumer of the library.
document.addEventListener('o.DOMContentLoaded', initialise);

/**
 * A constructed object, this module is a Singleton as we only want one
 * instance sending events. See {@link Tracking} for the publicly available
 * interface.
 * @type {Tracking}
 */
module.exports = tracking;

},{"./src/javascript/core/send":119,"./src/javascript/core/session":120,"./src/javascript/core/settings":121,"./src/javascript/core/user":127,"./src/javascript/events/custom":128,"./src/javascript/events/link-click":129,"./src/javascript/events/page-view":130,"./src/javascript/utils":131}],117:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var Send = require('./core/send');
var User = require('./core/user');
var Session = require('./core/session');

/**
 * Shared 'internal' scope.
 * @type {Object}
 */
var settings = require('./core/settings');
var utils = require('./utils');

/**
 * Default properties for sending a tracking request.
 * @type {Object}
 * @return {Object} - The default settings for the component.
 */
var defaultConfig = function defaultConfig() {
	return {
		async: true,
		callback: function callback() {},
		system: {},
		context: {},
		user: {
			passport_id: utils.getValueFromCookie(/USERID=([0-9]+):/) || utils.getValueFromCookie(/PID=([0-9]+)\_/),
			ft_session: utils.getValueFromCookie(/FTSession=([^;]+)/)
		}
	};
};

/**
 * Generate and store a new rootID.
 * @param {string} new_id - Optional rootID, if you want to use your own. Otherwise we'll create one for you.
 * @return {string|*} The rootID.
 */
function setRootID(new_id) {
	settings.set('root_id', requestID(new_id));
	return settings.get('root_id');
}

/**
 * Get rootID.
 * @return {string|*} The rootID.
 */
function getRootID() {
	var root_id = settings.get('root_id');

	if (utils.isUndefined(root_id)) {
		root_id = setRootID();
	}

	return root_id;
}

/**
 * Create a requestID (unique identifier) for the page impression.
 *
 * @param {string} request_id - Optional RequestID, if you want to use your own. Otherwise will create one for you.
 *
 * @return {string|*} The RequestID.
 */
function requestID(request_id) {
	if (utils.isUndefined(request_id)) {
		request_id = utils.guid();
	}

	return request_id;
}

/**
 * Make a tracking request.
 *
 * @param {Object} config - Should be passed an object containing a format and the values for that format
 * @param {function} callback - Fired when the request has been made.
 *
 * @return {Object} request
 */
function track(config, callback) {
	if (utils.isUndefined(callback)) {
		callback = function () {};
	}

	var coreContext = settings.get('config') && settings.get('config').context || {};
	config.context = utils.merge(coreContext, config.context);

	var request = utils.merge(defaultConfig(), utils.merge(config, { callback: callback }));

	var session = Session.session();

	/* Values here are kinda the mandatory ones, so we want to make sure they're possible. */
	request = utils.merge({
		context: {
			id: requestID(request.id), // Keep an ID if it's been set elsewhere.
			root_id: getRootID()
		},

		user: settings.get('config') ? settings.get('config').user : {},

		device: {
			spoor_session: session.id,
			spoor_session_is_new: session.isNew,
			spoor_id: User.userID()
		}
	}, request);

	utils.log('Core.Track', request);
	// Send it.
	Send.addAndRun(request);

	return request;
}

module.exports = {
	setRootID: setRootID,
	getRootID: getRootID,
	track: track
};

},{"./core/send":119,"./core/session":120,"./core/settings":121,"./core/user":127,"./utils":131}],118:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var utils = require('../utils');
var Store = require('./store');

/**
 * Class for handling a queue backed up by a store.
 * @class Queue
 *
 * @param {String} name - The name of the queue.
 * @return {Queue} - Returns the instance of the queue.
 */
var Queue = function Queue(name) {
	if (utils.isUndefined(name)) {
		var undefinedName = new Error('You must specify a name for the queue.');
		utils.broadcast('oErrors', 'log', {
			error: undefinedName.message,
			info: { module: 'o-tracking' }
		});
		throw undefinedName;
	}

	/**
  * Queue data.
  * @type {Array}
  */
	this.queue = [];

	/**
  * The storage method to use. Determines best storage method.
  * @type {Object}
  */
	this.storage = new Store(name);

	// Retrieve any previous store with the same name.
	if (this.storage.read()) {
		this.queue = this.storage.read();
	}

	return this;
};

/**
 * Gets the contents of the store.
 *
 * @return {Array} The array of items.
 */
Queue.prototype.all = function () {
	if (this.queue.length === 0) {
		return [];
	}

	var items = [];

	for (var i = 0; i < this.queue.length; i = i + 1) {
		items.push(this.queue[i].item);
	}

	return items;
};

/**
 * Gets the first item in the store.
 *
 * @return {Object} Returns the item.
 */
Queue.prototype.first = function () {
	if (this.queue.length === 0) {
		return null;
	}

	return this.queue[0].item;
};

/**
 * Gets the last item in the store.
 *
 * @return {Object} Returns the item.
 */
Queue.prototype.last = function () {
	if (this.queue.length === 0) {
		return null;
	}

	return this.queue.slice(-1)[0].item;
};

/**
 * Add data to the store.
 *
 * @param {Object} item - An item or an array of items.
 *
 * @return {Queue} - Returns the instance of the queue.
 */
Queue.prototype.add = function (item) {
	// I was trying to turn this whole add function into a little module, to stop doAdd function being created everytime, but couldn't work out how to get to 'this' from within the module.

	var self = this;
	var i = undefined;

	function doAdd(item) {
		self.queue.push({
			created_at: new Date().valueOf(),
			item: item
		});
	}

	if (utils.is(item, 'object') && item.constructor.toString().match(/array/i)) {
		for (i = 0; i < item.length; i = i + 1) {
			doAdd(item[i]);
		}
	} else {
		doAdd(item);
	}

	return self;
};

/**
 * Overwrite the store with something completely new.
 *
 * @param {Array} items The new array of data.
 *
 * @return {Queue} - Returns the instance of the queue.
 */
Queue.prototype.replace = function (items) {
	if (utils.is(items, 'object') && items.constructor.toString().match(/array/i)) {
		this.queue = [];
		this.add(items).save();

		return this;
	}

	var invalidArg = new Error('Argument invalid, must be an array.');
	utils.broadcast('oErrors', 'log', {
		error: invalidArg.message,
		info: { module: 'o-tracking' }
	});
	throw invalidArg;
};

/**
 * Pop the first item from the queue.
 *
 * @return {Object} The item.
 */
Queue.prototype.shift = function () {
	if (this.queue.length === 0) {
		return null;
	}

	var item = this.queue.shift().item;

	this.save();

	return item;
};

/**
 * Save the current store to localStorage so that old requests can still be sent after a page refresh.
 *
 * @return {Queue} - Returns the instance of the queue.
 */
Queue.prototype.save = function () {
	this.storage.write(this.queue);

	return this;
};

module.exports = Queue;

},{"../utils":131,"./store":122}],119:[function(require,module,exports){
/*global module, require, window */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var settings = require('./settings');
var utils = require('../utils');
var Queue = require('./queue');
var transports = require('./transports');
/**
 * Default collection server.
 */
var domain = 'http://test.spoor-api.ft.com';

/**
 * Queue queue.
 *
 * @type {Queue}
 */
var queue = undefined;

/**
 * Consistent check to see if we should use sendBeacon or not.
 *
 * @return {boolean}
 */
function should_use_sendBeacon() {
	return navigator.sendBeacon && Promise && (settings.get('config') || {}).useSendBeacon;
}

/**
 * Attempts to send a tracking request.
 *
 * @param {Object} request The request to be sent.
 * @param {Function} callback Callback to fire the next item in the queue.
 * @return {undefined}
 */
function sendRequest(request, callback) {
	var queueTime = request.queueTime;
	var offlineLag = new Date().getTime() - queueTime;
	var path = undefined;
	var transport = should_use_sendBeacon() ? transports.get('sendBeacon')() : window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest() ? transports.get('xhr')() : transports.get('image')();
	var user_callback = request.callback;

	var core_system = settings.get('config') && settings.get('config').system || {};
	var system = utils.merge(core_system, {
		api_key: settings.get('api_key'), // String - API key - Make sure the request is from a valid client (idea nicked from Keen.io) useful if a page gets copied onto a Russian website and creates noise
		version: settings.get('version'), // Version of the tracking client e.g. '1.2'
		source: settings.get('source') });

	// Source of the tracking client e.g. 'o-tracking'
	request = utils.merge({ system: system }, request);

	// Only bothered about offlineLag if it's longer than a second, but less than 12 months. (Especially as Date can be dodgy)
	if (offlineLag > 1000 && offlineLag < 12 * 30 * 24 * 60 * 60 * 1000) {
		request.time = request.time || {};
		request.time.offset = offlineLag;
	}
	delete request.callback;
	delete request.async;
	delete request.type;
	delete request.queueTime;

	utils.log('user_callback', user_callback);
	utils.log('PreSend', request);

	path = JSON.stringify(request);

	utils.log('path', path);

	transport.complete(function (error) {
		if (utils.is(user_callback, 'function')) {
			user_callback.call(request);
			utils.log('calling user_callback');
		}

		if (error) {
			// Re-add to the queue if it failed.
			// Re-apply queueTime here
			request.queueTime = queueTime;
			queue.add(request).save();

			utils.broadcast('oErrors', 'log', {
				error: error.message,
				info: { module: 'o-tracking' }
			});
		} else {
			callback && callback();
		}
	});

	// Both developer and noSend flags have to be set to stop the request sending.
	if (!(settings.get('developer') && settings.get('no_send'))) {
		transport.send(domain, path);
	}
}

/**
 * Adds a new request to the list of pending requests
 *
 * @param {Tracking} request The request to queue
 * @return {undefined}
 */
function add(request) {
	request.queueTime = new Date().getTime();
	if (should_use_sendBeacon()) {
		sendRequest(request);
	} else {
		queue.add(request).save();
	}
	utils.log('AddedToQueue', queue);
}

/**
 * If there are any requests queued, attempts to send the next one
 * Otherwise, does nothing
 * @param {Function} callback - Optional callback
 * @return {undefined}
 */
function run(callback) {
	if (utils.isUndefined(callback)) {
		callback = function () {};
	}

	var next = function next() {
		run();
		callback();
	};
	var nextRequest = queue.shift();

	// Cancel if we've run out of requests.
	if (!nextRequest) {
		return callback();
	}

	// Send this request, then try run again.
	return sendRequest(nextRequest, next);
}

/**
 * Convenience function to add and run a request all in one go.
 *
 * @param {Object} request The request to queue and run.
 * @return {undefined}
 */
function addAndRun(request) {
	add(request);
	run();
}

/**
 * Init the queue and send any leftover events.
 * @return {undefined}
 */
function init() {
	queue = new Queue('requests');

	if (settings.get('config') && settings.get('config').server) {
		domain = settings.get('config').server;
	}

	// If any tracking calls are made whilst offline, try sending them the next time the device comes online
	utils.addEvent(window, 'online', run);

	// On startup, try sending any requests queued from a previous session.
	run();

	return queue;
}

module.exports = {
	init: init,
	add: add,
	run: run,
	addAndRun: addAndRun
};

},{"../utils":131,"./queue":118,"./settings":121,"./transports":124}],120:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var store = undefined;
var defaultSessionConfig = {
	storage: 'best',
	name: 'session',
	expires: 30 * 60 * 1000 // 30 minutes
};

var utils = require('../utils');
var Store = require('./store');

/**
 * Set the session in the store.
 *
 * @param {String} session - The session to be stored.
 * @return {undefined}
 */
function setSession(session) {
	var d = new Date();
	d.setTime(d.getTime() + store.config.expires);

	store.write({
		value: session,
		expiry: d.valueOf()
	});
}

/**
 * Get the session from the store. Expiry and gen of a new session are handled here.
 *
 * @return {Object} the current session
 */
function getSession() {
	var s = store.read();
	var session = undefined;
	var isNew = false;

	if (s) {
		var d = new Date().valueOf();
		var exp = parseInt(s.expiry);

		// If current session is active.
		if (exp >= d) {
			session = s.value;
		}
	}

	// No active session, gen a new one.
	if (!session) {
		session = utils.guid();
		isNew = true;
	}

	// Refreshes the cookie...
	setSession(session);

	return {
		id: session,
		isNew: isNew
	};
}

/**
 * Init
 *
 * @param {String|Object} config The name used to store the session or configuration object.
 * @return {Session} - The session
 */
function init(config) {
	if (utils.is(config, 'string')) {
		config = { name: config };
	}

	if (utils.isUndefined(config)) {
		config = {};
	}

	var c = utils.merge(defaultSessionConfig, config);

	// config.name is important here, means the user has specifically asked for a cookie name.
	if (c.storage === 'cookie' && config.name) {
		c.nameOverride = c.name;
	}

	store = new Store(c.name, c);

	return getSession();
}

module.exports = {
	init: init,
	session: getSession
};

},{"../utils":131,"./store":122}],121:[function(require,module,exports){
/*global module */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var settings = {};

/**
 * Very basic implementation of deep clone, and only supports simple POJO objects and
 * native arrays.
 * @param  {*} value Any value
 * @return {*}       Copy of value
 * @private
 */
function clone(value) {
  if (value === undefined) {
    return value;
  }
  switch (Object.prototype.toString.call(value)) {
    case '[object Object]':
      return JSON.parse(JSON.stringify(value));
    case '[object Array]':
      return [].slice.call(value);
    default:
      return value;
  }
}

/**
 * Saves a value. Stores a copy rather than a reference, to avoid mutations leaking.
 *
 * @param {string} key - The key to use to store the object
 * @param {*} value - The value
 * @return {undefined}
 */
function setValue(key, value) {
  settings[key] = clone(value);
}

/**
 * Retrieves a value from the settings object. Returns a copy rather than reference, to
 * avoid mutations leaking.
 *
 * @param {string} key - The key to get
 * @return {*} - The setting.
 */
function getValue(key) {
  return clone(settings[key]);
}

/**
 * Deletes a value
 *
 * @param  {string} key - The key to delete
 * @return {undefined}
 */
function destroy(key) {
  delete settings[key];
}

module.exports = {
  'set': setValue,
  'get': getValue,
  'destroy': destroy
};

},{}],122:[function(require,module,exports){
/*global module, require, window */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

/**
 * Class for storing data
 * Will choose the 'best' storage method available. Can also specify a type of storage.
 *
 * @class  Store
 * @param {string} name - The name of the store
 * @param {Object} config - Optional, config object for extra configuration
 */
;
var Store = function Store(name, config) {

	/**
  * Internal Storage key prefix.
  */
	var keyPrefix = 'o-tracking';

	/**
  * Temporary var containing data from a previously saved store.
  * @property loadStore
  */
	var loadStore = undefined;
	var utils = require('../utils');

	if (utils.isUndefined(name)) {
		var undefinedName = new Error('You must specify a name for the store.');
		utils.broadcast('oErrors', 'log', {
			error: undefinedName.message,
			info: { module: 'o-tracking' }
		});
		throw undefinedName;
	}

	this.config = utils.merge({ storage: 'best', expires: 10 * 365 * 24 * 60 * 60 * 1000 }, config);

	/**
  * Store data.
  */
	this.data = null;

	/**
  * The key/name of this store.
  */
	this.storageKey = this.config.hasOwnProperty('nameOverride') ? this.config.nameOverride : [keyPrefix, name].join('_');

	/**
  * The storage method to use. Determines best storage method.
  *
  * @type {Object}
  */
	this.storage = (function (config, window) {
		var test_key = keyPrefix + '_InternalTest';

		// If cookie has been manually specified, don't bother with local storage.
		if (config.storage !== 'cookie') {
			try {
				if (window.localStorage) {
					window.localStorage.setItem(test_key, 'TEST');

					if (window.localStorage.getItem(test_key) === 'TEST') {
						window.localStorage.removeItem(test_key);
						return {
							_type: 'localStorage',
							load: function load(name) {
								return window.localStorage.getItem.call(window.localStorage, name);
							},
							save: function save(name, value) {
								return window.localStorage.setItem.call(window.localStorage, name, value);
							},
							remove: function remove(name) {
								return window.localStorage.removeItem.call(window.localStorage, name);
							}
						};
					}
				}
			} catch (error) {
				utils.broadcast('oErrors', 'log', {
					error: error.message,
					info: { module: 'o-tracking' }
				});
			}
		}

		function cookieLoad(name) {
			name = name + '=';

			var cookies = window.document.cookie.split(';');
			var i = undefined;
			var cookie = undefined;

			for (i = 0; i < cookies.length; i = i + 1) {
				cookie = cookies[i].replace(/^\s+|\s+$/g, '');
				if (cookie.indexOf(name) === 0) {
					return utils.decode(cookie.substring(name.length, cookie.length));
				}
			}

			return null;
		}

		function cookieSave(name, value, expiry) {
			var d = undefined;
			var expires = '';
			var cookie = undefined;

			if (utils.is(expiry, 'number')) {
				d = new Date();
				d.setTime(d.getTime() + expiry);
				expires = 'expires=' + d.toGMTString() + ';';
			}

			cookie = utils.encode(name) + '=' + utils.encode(value) + ';' + expires + 'path=/;' + (config.domain ? 'domain=.' + config.domain + ';' : '');
			window.document.cookie = cookie;
		}

		function cookieRemove(name) {
			cookieSave(name, '', -1);
		}

		cookieSave(test_key, 'TEST');

		if (cookieLoad(test_key) === 'TEST') {
			cookieRemove(test_key);

			return {
				_type: 'cookie',
				load: cookieLoad,
				save: cookieSave,
				remove: cookieRemove
			};
		}

		return {
			_type: 'none',
			load: function load() {},
			save: function save() {},
			remove: function remove() {}
		};
	})(this.config, window);

	// Retrieve any previous store with the same name.
	loadStore = this.storage.load(this.storageKey);
	if (loadStore) {
		try {
			this.data = JSON.parse(loadStore);
		} catch (error) {
			utils.broadcast('oErrors', 'log', {
				error: error.message,
				module: 'o-tracking'
			});
			this.data = loadStore;
		}
	}

	return this;
};

/**
 * Get/Read the current data.
 *
 * @return {Object} Returns the data from the store.
 */
Store.prototype.read = function () {
	return this.data;
};

/**
 * Write the supplied data to the store.
 *
 * @param {String} data - The data to write.
 * @return {Store} - The instance of the store
 */
Store.prototype.write = function (data) {
	// Set this.data, in-case we're on a file:// domain and can't set cookies.
	this.data = data;
	this.storage.save(this.storageKey, typeof this.data === 'string' ? this.data : JSON.stringify(this.data), this.config.expires);

	return this;
};

/**
 * Delete the current data.
 * @return {Store} - The instance of the store
 */
Store.prototype.destroy = function () {
	this.data = null;
	this.storage.remove(this.storageKey);
	return this;
};

module.exports = Store;

},{"../utils":131}],123:[function(require,module,exports){
'use strict';

var utils = require('../../utils');

module.exports = function () {
	var image = new Image(1, 1);

	return {
		send: function send(url, data) {
			image.src = url + '?data=' + utils.encode(data);
		},
		complete: function complete(callback) {
			if (image.addEventListener) {
				image.addEventListener('error', callback);
				image.addEventListener('load', function () {
					return callback();
				});
			} else {
				// it's IE!
				image.attachEvent('onerror', callback);
				image.attachEvent('onload', function () {
					return callback();
				});
			}
		}
	};
};

},{"../../utils":131}],124:[function(require,module,exports){
'use strict';

module.exports = {
	xhr: require('./xhr'),
	sendBeacon: require('./send-beacon'),
	image: require('./image'),
	get: function get(name) {
		return this.mock || this[name];
	}
};

},{"./image":123,"./send-beacon":125,"./xhr":126}],125:[function(require,module,exports){
'use strict';

module.exports = function () {
    var resolver = undefined;
    var rejecter = undefined;
    var p = new Promise(function (resolve, reject) {
        resolver = resolve;
        rejecter = reject;
    });
    return {
        send: function send(url, data) {
            if (navigator.sendBeacon(url, data)) {
                resolver();
            } else {
                rejecter(new Error('Failed to send beacon event: ' + data.toString()));
            }
        },
        complete: function complete(callback) {
            callback && p.then(callback, callback);
        }
    };
};

},{}],126:[function(require,module,exports){
'use strict';

module.exports = function () {
	var xhr = new window.XMLHttpRequest();

	return {
		send: function send(url, data) {
			xhr.open('POST', url, true);
			xhr.withCredentials = true;
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.send(data);
		},
		complete: function complete(callback) {
			xhr.onerror = function () {
				callback(this);
			};
			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					callback();
				} else {
					callback('Incorrect response: ' + xhr.status);
				}
			};
		}
	};
};

},{}],127:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var _userID = undefined;
var store = undefined;
var defaultUserConfig = {
	storage: 'cookie',
	name: 'spoor-id',
	value: null,
	domain: document.URL.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1].indexOf('ft.com') > -1 ? 'ft.com' : null
};

var utils = require('../utils');
var Store = require('./store');

/**
 * migrate_across_domains
 * Clean up after forgetting to write cookies to the 'root' ft.com domain.
 * - Check local storage for the 'proper' value.
 * - If it exists, use it.
 * - If not, set current user id as the 'proper' value.
 * - If this value and the cookie match, then we've already fixed it.
 * - If not, drop the cookie and it will be reset it on the root domain.
 *
 * @param {Store} store - The storage instance used for storing the ID.
 * @param {String} user_id - The user ID to check against storage.
 * @return {String} - The real user ID.
 */
function migrate_across_domains(store, user_id) {
	var ls_name = 'o-tracking-proper-id';
	var proper_id = undefined;

	try {
		// This isn't consistent in at least Firefox, maybe more, localstorage seems secured at subdomian level.
		proper_id = utils.getValueFromCookie(ls_name + '=([^;]+)');

		if (!proper_id) {
			var d = new Date();
			d.setTime(d.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
			var expires = 'expires=' + d.toGMTString() + ';';

			window.document.cookie = ls_name + '=' + utils.encode(user_id) + ';' + expires + 'path=/;domain=.' + defaultUserConfig.domain + ';';
			proper_id = user_id;
		}
	} catch (error) {
		utils.broadcast('oErrors', 'log', {
			error: error.message,
			info: { module: 'o-tracking' }
		});
		proper_id = user_id;
	}

	// Expire the cookie on the (sub)domain
	window.document.cookie = 'spoor-id=0;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
	// Re-set the cookie on the  root domain
	store.write(proper_id);

	return proper_id;
}

/**
 * Init
 *
 * @param {String|Object} value The value of a userID to use or configuration object.
 * @return {String} - The user ID.
 */
function init(value) {
	var config = utils.merge(defaultUserConfig, { value: value });

	// config.name is important here, means the user has specifically asked for a cookie name.
	if (config.storage === 'cookie' && config.name) {
		config.nameOverride = config.name;
	}

	store = new Store(config.name, config);

	_userID = store.read();

	if (_userID) {
		_userID = migrate_across_domains(store, _userID);
	}

	if (!_userID) {
		_userID = config.value;
	}

	if (!_userID) {
		_userID = utils.guid();
	}

	store.write(_userID); // Refreshes the cookie...

	return _userID;
}

function destroy() {
	store.destroy();
}

module.exports = {
	init: init,
	userID: function userID() {
		return _userID;
	},
	destroy: destroy
};

},{"../utils":131,"./store":122}],128:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var Core = require('../core');
var utils = require('../utils');

/**
 * Default properties for events.
 *
 * @type {Object}
 * @return {Object} - Default configuration for events
 */
var defaultEventConfig = function defaultEventConfig() {
	return {
		category: 'event',
		action: 'generic',
		context: {}
	};
};

/**
 * Track an event.
 *
 * @param {Event} trackingEvent - The event, which could the following properties in its 'detail' key:
 *   [category] - The category, for example: video
 *   [action] - The action performed, for example: play
 *   [component_id] - Optional. The ID for the component instance.
 *
 * @param {Function} callback - Optional, Callback function. Called when request completed.
 * @return {undefined}
 */
function event(trackingEvent, callback) {
	if (utils.is(trackingEvent.detail.category) || utils.is(trackingEvent.detail.action)) {
		var noCategoryActionVals = 'Missing category or action values';
		utils.broadcast('oErrors', 'log', {
			error: noCategoryActionVals,
			info: { module: 'o-tracking' }
		});
		throw noCategoryActionVals;
	}

	var config = utils.merge(defaultEventConfig(), {
		category: trackingEvent.detail.category,
		action: trackingEvent.detail.action,
		context: trackingEvent.detail
	});

	delete config.context.category;
	delete config.context.action;

	var origamiElement = getOrigamiEventTarget(trackingEvent);
	if (origamiElement) {
		config.context.component_name = origamiElement.getAttribute('data-o-component');
		config.context.component_id = config.context.component_id || getComponentId(origamiElement);
	} else {
		config.context.component_name = config.context.component_name;
		config.context.component_id = config.context.component_id;
	}

	Core.track(config, callback);
}

/**
 * Helper function that gets the target of an event if it's an Origami component
 * @param  {Event} event - The event triggered.
 * @return {HTMLElement|undefined} - Returns the HTML element if an Origami component, else undefined.
 */
function getOrigamiEventTarget(event) {
	// IE backwards compatibility (get the actual target). If not IE, uses
	// `event.target`
	var element = event.target || event.srcElement;

	if (element && element.getAttribute('data-o-component')) {
		return element;
	} else {
		return;
	}
}

/**
 * Helper function that generates a component id based on its xpath
 *
 * @param {HTMLElement} element - The HTML Element to gen an ID for.
 *
 * @return {string} hash
 */
function getComponentId(element) {
	var path = _getElementPath(element);

	if (typeof path === 'undefined') {
		return;
	}

	// Select the source element (first item in the ordered sequence `path`)
	var srcElement = path[0];

	// Because, you could have two identical elements in the DOM as siblings,
	// we need to determine the 'sibling index': the order they're sitting within a DOM node.
	// Although in reality this is unlikely to always be the same, it's just a
	// best guess - unless child elements are always appended to an element rather than added as the first child.
	var siblingIndex = (function getSiblingIndex(element) {
		var srcParent = element.parentElement;
		if (srcParent) {
			for (var i = 0; i < srcParent.childNodes.length; i++) {
				if (srcParent.childNodes[i] === srcElement) {
					return i;
				}
			}
			return -1;
		} else {
			return 0;
		}
	})(srcElement);

	// Generate a normalised string (normalising browser quirks) from the sequence of elements
	var normalisedStringPath = path.reduceRight(function (builder, el) {
		if (!el.nodeName) {
			return builder + ' - ' + el.constructor.name + '\n';
		}

		var nodeName = el.nodeName.toLowerCase();

		// In some browsers, document is prepended with a '#'
		if (nodeName.indexOf('#') === 0) {
			return builder + '<' + nodeName + '>';
		}

		// Replace this stuff with stuff that makes each node unique - without including styling detail (as this may change depending on animation state etc, position)
		return builder + '<' + nodeName + ' id="' + (el.id || '') + '">';
	}, '');

	// Append a sibling index to the string and use some simple, off the shelf string hashing algorithm.
	return _generateHash(normalisedStringPath + '_siblingIndex=' + siblingIndex);
}

/**
 * Gets the xpath for an element
 *
 * @param  {HTMLElement} element - The element to get a path for.
 *
 * @private
 *
 * @return {array} The xpath
 */
function _getElementPath(element) {
	var path = [];

	while (element) {
		path.push(element);
		element = element.parentElement;
	}

	return path;
}

/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 * Copyright (c) 2011 Gary Court
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @param {string} str  - The string to hash, ASCII only.
 *
 * @return {number} 32-bit positive integer hash
 *
 * @private
 */
function _generateHash(str) {
	var l = str.length;
	var h = 1 ^ l;
	var i = 0;
	var k = undefined;

	while (l >= 4) {
		k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;

		k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
		k ^= k >>> 24;
		k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);

		h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;

		l -= 4;
		++i;
	}

	switch (l) {
		case 3:
			h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
			break;
		case 2:
			h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
			break;
		case 1:
			h ^= str.charCodeAt(i) & 0xff;
			h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	}

	h ^= h >>> 13;
	h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	h ^= h >>> 15;

	return h >>> 0;
}

module.exports = event;
module.exports.init = function () {
	utils.addEvent(window, 'oTracking.event', event);
};

},{"../core":117,"../utils":131}],129:[function(require,module,exports){
/*global module, require, window */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var Queue = require('../core/queue');
var Core = require('../core');
var utils = require('../utils');
var internalQueue = undefined;

/**
 * Default properties for events.
 *
 * @type {Object}
 * @return {Object} The default link configuration.
 */
var defaultLinkConfig = function defaultLinkConfig() {
	return {
		category: 'link',
		action: 'click',
		context: {}
	};
};

var callback = function callback() {};

/**
 * Check if a URL is going to the same site (internal)
 *
 * @param {string} url - The url to check.
 *
 * @return {boolean} - Result of internal url.
 * @private
 */
function isInternal(url) {
	return url.indexOf(window.document.location.hostname) > -1;
}

/**
 * Check if a URL is going to an external site.
 *
 * @param {string} url - The url to check.
 *
 * @return {boolean} - The result of external url.
 * @private
 */
function isExternal(url) {
	return !isInternal(url);
}

/**
 * Checks if a URL is pointing at a file.
 * NOTE: Don't want to maintain a list of file extensions, so try best guess.
 *
 * @param {string} url - The url to check.
 *
 * @return {boolean} - The result if a url is a file location.
 * @private
 */
function isFile(url) {
	var path = url.replace(/^\w+:\/\//, '').replace(/(#|\?).+/g, '').replace(/\/$/, '');

	// It must have a slash to have a file path
	if (path.indexOf('/') === -1) {
		return false;
	}

	// No extension
	if (!path.match(/\.(\w{2,4})$/)) {
		return false;
	}

	// Obviously a web page.
	if (['html', 'htm', 'php'].indexOf(RegExp.$1) > -1) {
		return false;
	}

	return true;
}

/**
 * Calculates the parents of a HTML element.
 *
 * @param {Element} element - The starting element.
 *
 * @return {array} The tree of parent elements.
 * @private
 */
function parentTree(element) {
	if (!element) {
		return [];
	}

	var tree = [element];

	if (element.nodeName === 'BODY') {
		return tree;
	}

	return tree.concat(parentTree(element.parentElement));
}

/**
 * Create the identifier of the link. TODO: https://rally1.rallydev.com/#/16966478977d/detail/defect/17919485944
 *
 * @param {Element} link - The link element.
 *
 * @return {string} The ID for the link.
 * @private
 */
function createLinkID(link) {
	var parents = parentTree(link);
	var name = link.href || link.text || link.name || link.id;

	name = name.replace(/^http:\/\/[\w\.\:]+/, '') // Remove http://[something].
	.replace(/^\//, '') // Remove slash at beginning
	.replace(/(\?|#).*$/, '') // Remove query string and page anchor (#)
	.replace(/\/$/, '') // Remove trailing slash
	.replace(/\.[a-z]{3,4}$/, ''); // Remove final '.com' or similar

	// If it's an external URL
	if (name === '') {
		name = link.href.replace(/^http:\/\//, '').split('?')[0].replace(/\/$/, '');
	}

	// Last 2 items of URL
	name = name.split('/').slice(-2).filter(function (obj) {
		return obj;
	});

	// If uuid then take final value only
	if (name.slice(-1)[0].match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)) {
		name = name.slice(-1);
	}

	// Remove slashes as final outcome is slash delimited
	name = (name.length > 1 ? name.slice(0, 2).join('-') : name[0]).toLowerCase();

	return parents.map(function (p) {
		return p.tagName.toLowerCase();
	}).filter(function (e, i, arr) {
		return arr.lastIndexOf(e) === i;
	}).reverse().join('/') + '/' + name;
}

/**
 * Track the link.
 *
 * @param {Element} element - The element being tracked.
 *
 * @return {Object|boolean} - If synscronous, returns when the tracking event is sent, if async, returns true immediately.
 */
function track(element) {
	var linkID = createLinkID(element);
	var config = utils.merge(defaultLinkConfig(), {
		context: {
			link: {
				id: linkID,
				source_id: Core.getRootID(),
				href: element.href,
				title: element.text
			}
		}
	});

	if (isExternal(element.href) || isFile(element.href)) {
		// Send now
		config.async = false;
		return Core.track(config, callback);
	}

	if (isInternal(element.href)) {
		// Queue and send on next page.
		internalQueue.add(config).save();
	}

	return true;
}

/**
 * Handle a click event.
 *
 * @param {Event} event - The event.
 *
 * @return {boolean} - Returns the result of the tracking request
 * @private
 */
function clickEvent(event) {
	return track(event.target);
}

/**
 * Set the callback called on every link tracking event.
 *
 * @param {Function} cb - The callback.
 * @return {undefined}
 */
function onClick(cb) {
	callback = cb;
}

/**
 * If there are any requests queued, attempts to send the next one
 * Otherwise, does nothing
 * @return {undefined}
 */
function runQueue() {
	var next = function next() {
		runQueue();callback();
	};
	var nextLink = internalQueue.shift();
	if (nextLink) {
		Core.track(nextLink, next);
	}
}

/**
 * Listener for links.
 *
 * @param {CustomEvent} e - The CustomEvent
 * @private
 * @return {undefined}
 */
function listener(e) {
	track(e.detail);
}

/**
 * Setup and initialise link tracking.
 *
 * @param {Object}  config - Initial configuration
 * @param {Element} config.root - Optional. The root element to search for links. Defaults to window.document - useful if trying to track links from an iframe.
 * @param {string}  config.selector - Optional. The selector to use to search for links. Defaults to 'a'.
 * @param {string}  config.event - Optional. The event to listen on. Defaults to 'click'.
 * @param {array}   config.links - Optional. If you've already worked out the links to track, then this is used to pass them over. Must be an array with elements that accept events.
 *
 * @return {array} The links setup in this init.
 */
function init(config) {
	var links = undefined;
	var i = undefined;

	internalQueue = new Queue('links');

	runQueue();

	// Listen for page requests. If this is a single page app, we can send link requests now.
	utils.onPage(runQueue);

	if (utils.isUndefined(config)) {
		config = {};
	}
	config = utils.merge({
		root: window.document,
		selector: 'a',
		event: 'click',
		links: null
	}, config);

	if (config.hasOwnProperty('callback')) {
		callback = config.callback;
	}

	if (config.links && utils.is(config.links, 'object') && config.links.constructor.toString().match(/array/i)) {
		links = config.links;

		for (i = 0; i < links.length; i = i + 1) {
			utils.addEvent(links[i], config.event, clickEvent);
		}
	} else {
		if (_typeof(config.root) !== 'object' || typeof config.selector !== 'string') {
			var configException = 'If supplying a config it must have a valid root element and a selector string';
			utils.broadcast('oErrors', 'log', {
				error: configException,
				info: { module: 'o-tracking' }
			});
			throw configException;
		}

		utils.addEvent(config.root, config.event, function (event) {
			if (event.target.tagName === config.selector.toUpperCase()) {
				clickEvent.call(event.target, event);
			}
		});
	}

	utils.addEvent(window, 'oTracking.link', listener);
}

module.exports = {
	init: init,
	onClick: onClick,
	track: track
};

},{"../core":117,"../core/queue":118,"../utils":131}],130:[function(require,module,exports){
/*global module, require */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

;
var Core = require('../core');
var utils = require('../utils');

/**
 * Default properties for page tracking requests.
 *
 * @return {Object} - The default properties for pages.
 */
var defaultPageConfig = function defaultPageConfig() {
	return {
		category: 'page',
		action: 'view',
		context: {
			url: document.URL,
			referrer: document.referrer
		},

		async: true // Send this event asyncronously - as sync doesn't work in FF, as it doesn't send cookies. https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#withCredentials
	};
};

/**
 * Make the page tracking request.
 *
 * @param {Object} config - Configuration object. If omitted, will use the defaults.
 * @param {Function} callback - Callback function. Called when request completed.
 * @return {undefined}
 */
function page(config, callback) {
	config = utils.merge(defaultPageConfig(), {
		context: config
	});

	// New PageID for a new Page.
	Core.setRootID();
	Core.track(config, callback);

	// Alert internally that a new page has been tracked - for single page apps for example.
	utils.triggerPage();
}

/**
 * Listener for pages.
 *
 * @param {CustomEvent} e - The CustomEvent
 * @private
 * @return {undefined}
 */
function listener(e) {
	page(e.detail);
}

module.exports = page;
module.exports.init = function () {
	utils.addEvent(window, 'oTracking.page', listener);
};

},{"../core":117,"../utils":131}],131:[function(require,module,exports){
/*global module, require, window */
/*eslint-disable*/
'use strict'
/*eslint-enable*/

/**
 * Shared 'internal' scope.
 * @private
 */
;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var settings = require('./core/settings');

/**
 * CUID Generator
 */
var cuid = require('../libs/browser-cuid');

/**
 * Record of callbacks to call when a page is tracked.
 */
var page_callbacks = [];

/**
 * Log messages to the browser console. Requires 'log' to be set on init.
 *
 * @param {*} List of objects to log
 * @return {undefined}
 */
function log() {
	if (settings.get('developer') && window.console) {
		for (var i = 0; i < arguments.length; i++) {
			window.console.log(arguments[i]);
		}
	}
}

/**
 * Tests if variable is a certain type. Defaults to check for undefined if no type specified.
 *
 * @param {*} variable - The variable to check.
 * @param {string} type - The type to test for. Defaults to undefined.
 *
 * @return {boolean} - The answer for if the variable is of type.
 */
function is(variable, type) {
	if (!type) {
		type = 'undefined';
	}
	return (typeof variable === 'undefined' ? 'undefined' : _typeof(variable)) === type;
}

/**
 * Merge objects together. Will remove 'falsy' values.
 *
 * @param {Object} target - The original object to merge in to.
 * @param {Object} options - The object to merge into the target. If omitted, will merge target into a new empty Object.
 *
 * @return {Object} The merged object.
 */
function merge(target, options) {
	if (!options) {
		options = target;
		target = {};
	}

	var name = undefined;
	var src = undefined;
	var copy = undefined;

	/* jshint -W089 */
	/* eslint guard-for-in: 0 */
	for (name in options) {
		src = target[name];
		copy = options[name];

		// Prevent never-ending loop
		if (target === copy) {
			continue;
		}

		// Gets rid of missing values too
		if (typeof copy !== 'undefined' && copy !== null) {
			target[name] = src === Object(src) && !is(src, 'function') ? merge(src, copy) : copy;
		}
	}
	/* jshint +W089 */
	/* jslint forin:true */

	return target;
}

/**
 * URL encode a string.
 * @param {string} str - The string to be encoded.
 *
 * @return {string} The encoded string.
 */
function encode(str) {
	if (window.encodeURIComponent) {
		return window.encodeURIComponent(str);
	} else {
		return window.escape(str);
	}
}

/**
 * URL decode a string.
 * @param {string} str - The string to be decoded.
 *
 * @return {string} The decoded string.
 */
function decode(str) {
	if (window.decodeURIComponent) {
		return window.decodeURIComponent(str);
	} else {
		return window.unescape(str);
	}
}

/*
 * Utility to add event listeners.
 *
 * @param {Element} element
 * @param {string} event
 * @param {Function} listener
 */
function addEvent(element, event, listener) {
	if (element.addEventListener) {
		element.addEventListener(event, listener, false);
	} else {
		element.attachEvent('on' + event, listener);
	}
}

/*
 * Utility for dispatching custom events from window
 *
 * @param {string} namespace
 * @param {string} eventType
 * @param {Object} detail
 */
function broadcast(namespace, eventType, detail) {
	detail = detail || {};
	try {
		window.dispatchEvent(new CustomEvent(namespace + '.' + eventType, {
			detail: detail,
			bubbles: true
		}));
	} catch (error) {}
}

/**
 * Listen for page tracking requests.
 *
 * @param {Function} cb - The callback to be called whenever a page is tracked.
 * @return {undefined}
 */
function onPage(cb) {
	if (is(cb, 'function')) {
		page_callbacks.push(cb);
	}
}

/**
 * Trigger the 'page' listeners.
 * @return {undefined}
 */
function triggerPage() {
	for (var i = 0; i < page_callbacks.length; i++) {
		page_callbacks[i]();
	}
}

/**
 * Get a value from document.cookie matching the first match of the regexp you supply
 * @param {RegExp} matcher - The Regex to match with
 * @return {String} - The vale from the cookie
 */
function getValueFromCookie(matcher) {
	return document.cookie.match(matcher) && RegExp.$1 !== '' && RegExp.$1 !== 'null' ? RegExp.$1 : null;
}

/**
 * Get a value from the url, used for uuid or querystring parameters
 * @param {RegExp} matcher - The Regex to match with
 * @return {String} - The value from the URL
 */
function getValueFromUrl(matcher) {
	return document.location.href.match(matcher) && RegExp.$1 !== '' ? RegExp.$1 : null;
}

/**
 * Get a value from a specified JavaScript variable.
 * @param {String} str - The name of variable, in dot syntax.
 * @return {String} The value from the JS variable.
 */
function getValueFromJsVariable(str) {
	if (typeof str !== 'string') {
		return null;
	}

	var i = undefined;
	var namespaces = str.split('.');
	var test = window;

	for (i = 0; i < namespaces.length; i = i + 1) {
		if (typeof test[namespaces[i]] === 'undefined') {
			return null;
		}

		test = test[namespaces[i]];
	}

	return test !== '' ? test : null;
}

module.exports = {
	log: log,
	is: is,
	isUndefined: is,
	merge: merge,
	encode: encode,
	decode: decode,
	guid: cuid,
	addEvent: addEvent,
	broadcast: broadcast,
	onPage: onPage,
	triggerPage: triggerPage,
	getValueFromCookie: getValueFromCookie,
	getValueFromUrl: getValueFromUrl,
	getValueFromJsVariable: getValueFromJsVariable
};

},{"../libs/browser-cuid":132,"./core/settings":121}],132:[function(require,module,exports){
'use strict';

/*eslint-disable*/
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';

  var namespace = 'cuid',
      c = 0,
      blockSize = 4,
      base = 36,
      discreteValues = Math.pow(base, blockSize),
      pad = function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  },
      randomBlock = function randomBlock() {
    return pad((Math.random() * discreteValues << 0).toString(base), blockSize);
  },
      safeCounter = function safeCounter() {
    c = c < discreteValues ? c : 0;
    c++; // this is not subliminal
    return c - 1;
  },
      api = function cuid() {
    // Starting with a lowercase letter makes
    // it HTML element ID friendly.
    var letter = 'c',
        // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = new Date().getTime().toString(base),

    // Prevent same-machine collisions.
    counter,

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    fingerprint = api.fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

    counter = pad(safeCounter().toString(base), blockSize);

    return letter + timestamp + counter + fingerprint + random;
  };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
        counter,
        print = api.fingerprint().slice(0, 1) + api.fingerprint().slice(-1),
        random = randomBlock().slice(-2);

    counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
      var i,
          count = 0;

      for (i in window) {
        count++;
      }

      return count;
    })();

    api.globalCount = function () {
      return cache;
    };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length + navigator.userAgent.length).toString(36) + api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }
})(undefined);
/*eslint-enable */

},{}],133:[function(require,module,exports){
'use strict';

var _debug;
var utils = require('./src/utils');
var throttle = require("./../lodash/function/throttle");
var debounce = require("./../lodash/function/debounce");

var listeners = {};
var intervals = {
	resize: 100,
	orientation: 100,
	visibility: 100,
	scroll: 100
};

function setThrottleInterval(eventType, interval) {
	if (typeof arguments[0] === 'number') {
		setThrottleInterval('scroll', arguments[0]);
		setThrottleInterval('resize', arguments[1]);
		setThrottleInterval('orientation', arguments[2]);
		setThrottleInterval('visibility', arguments[3]);
	} else if (interval) {
		intervals[eventType] = interval;
	}
}

function listenToResize() {
	if (listeners.resize) {
		return;
	}
	var eventType = 'resize';
	var handler = debounce(function (ev) {
		utils.broadcast('resize', {
			viewport: utils.getSize(),
			originalEvent: ev
		});
	}, intervals.resize);

	window.addEventListener(eventType, handler);
	listeners.resize = {
		eventType: eventType,
		handler: handler
	};
}

function listenToOrientation() {

	if (listeners.orientation) {
		return;
	}

	var eventType = 'orientationchange';
	var handler = debounce(function (ev) {
		utils.broadcast('orientation', {
			viewport: utils.getSize(),
			orientation: utils.getOrientation(),
			originalEvent: ev
		});
	}, intervals.orientation);

	window.addEventListener(eventType, handler);
	listeners.orientation = {
		eventType: eventType,
		handler: handler
	};
}

function listenToVisibility() {

	if (listeners.visibility) {
		return;
	}

	var eventType = utils.detectVisiblityAPI().eventType;
	var handler = debounce(function (ev) {
		utils.broadcast('visibility', {
			hidden: utils.getVisibility(),
			originalEvent: ev
		});
	}, intervals.visibility);

	window.addEventListener(eventType, handler);

	listeners.visibility = {
		eventType: eventType,
		handler: handler
	};
}

function listenToScroll() {

	if (listeners.scroll) {
		return;
	}

	var eventType = 'scroll';
	var handler = throttle(function (ev) {
		var scrollPos = utils.getScrollPosition();
		utils.broadcast('scroll', {
			viewport: utils.getSize(),
			scrollHeight: scrollPos.height,
			scrollLeft: scrollPos.left,
			scrollTop: scrollPos.top,
			scrollWidth: scrollPos.width,
			originalEvent: ev
		});
	}, intervals.scroll);

	window.addEventListener(eventType, handler);
	listeners.scroll = {
		eventType: eventType,
		handler: handler
	};
}

function listenTo(eventType) {
	if (eventType === 'resize' || eventType === 'all') {
		listenToResize();
	}

	if (eventType === 'scroll' || eventType === 'all') {
		listenToScroll();
	}

	if (eventType === 'orientation' || eventType === 'all') {
		listenToOrientation();
	}

	if (eventType === 'visibility' || eventType === 'all') {
		listenToVisibility();
	}
}

function stopListeningTo(eventType) {
	if (eventType === 'all') {
		Object.keys(listeners).forEach(stopListeningTo);
	} else if (listeners[eventType]) {
		window.removeEventListener(listeners[eventType].eventType, listeners[eventType].handler);
		delete listeners[eventType];
	}
}

module.exports = {
	debug: function debug() {
		_debug = true;
		utils.debug();
	},
	listenTo: listenTo,
	stopListeningTo: stopListeningTo,
	setThrottleInterval: setThrottleInterval,
	getOrientation: utils.getOrientation,
	getSize: utils.getSize,
	getScrollPosition: utils.getScrollPosition
};

},{"./../lodash/function/debounce":8,"./../lodash/function/throttle":10,"./src/utils":134}],134:[function(require,module,exports){
/* jshint devel: true */

'use strict';

var _debug;

function broadcast(eventType, data, target) {
	target = target || document.body;

	if (_debug) {
		console.log('o-viewport', eventType, data);
	}

	target.dispatchEvent(new CustomEvent('oViewport.' + eventType, {
		detail: data,
		bubbles: true
	}));
}

function getHeight() {
	return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function getWidth() {
	return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}

function getSize() {
	return {
		height: getHeight(),
		width: getWidth()
	};
}

function getScrollPosition() {
	var de = document.documentElement;
	var db = document.body;

	// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
	var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';

	var ieX = isCSS1Compat ? de.scrollLeft : db.scrollLeft;
	var ieY = isCSS1Compat ? de.scrollTop : db.scrollTop;
	return {
		height: db.scrollHeight,
		width: db.scrollWidth,
		left: window.pageXOffset || window.scrollX || ieX,
		top: window.pageYOffset || window.scrollY || ieY
	};
}

function getOrientation() {
	var orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation || undefined;
	if (orientation) {
		return typeof orientation === 'string' ? orientation.split('-')[0] : orientation.type.split('-')[0];
	} else if (window.matchMedia) {
		return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
	} else {
		return getHeight() >= getWidth() ? 'portrait' : 'landscape';
	}
}

function detectVisiblityAPI() {
	var hiddenName;
	var eventType;
	if (typeof document.hidden !== 'undefined') {
		hiddenName = 'hidden';
		eventType = 'visibilitychange';
	} else if (typeof document.mozHidden !== 'undefined') {
		hiddenName = 'mozHidden';
		eventType = 'mozvisibilitychange';
	} else if (typeof document.msHidden !== 'undefined') {
		hiddenName = 'msHidden';
		eventType = 'msvisibilitychange';
	} else if (typeof document.webkitHidden !== 'undefined') {
		hiddenName = 'webkitHidden';
		eventType = 'webkitvisibilitychange';
	}

	return {
		hiddenName: hiddenName,
		eventType: eventType
	};
}

function getVisibility() {
	var hiddenName = detectVisiblityAPI().hiddenName;
	return document[hiddenName];
}

module.exports = {
	debug: function debug() {
		_debug = true;
	},
	broadcast: broadcast,
	getSize: getSize,
	getScrollPosition: getScrollPosition,
	getVisibility: getVisibility,
	getOrientation: getOrientation,
	detectVisiblityAPI: detectVisiblityAPI
};

},{}],135:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/*! Raven.js 1.3.0 (768fdca) | github.com/getsentry/raven-js */

/*
 * Includes TraceKit
 * https://github.com/getsentry/TraceKit
 *
 * Copyright 2015 Matt Robenolt and other contributors
 * Released under the BSD license
 * https://github.com/getsentry/raven-js/blob/master/LICENSE
 *
 */
;(function (window, undefined) {
    'use strict'

    /*
     TraceKit - Cross brower stack traces - github.com/occ/TraceKit
     MIT license
    */

    ;
    var TraceKit = {
        remoteFetching: false,
        collectWindowErrors: true,
        // 3 lines before, the offending line, 3 lines after
        linesOfContext: 7,
        debug: false
    };

    // global reference to slice
    var _slice = [].slice;
    var UNKNOWN_FUNCTION = '?';

    function getLocationHref() {
        if (typeof document === 'undefined') return '';

        return document.location.href;
    };

    /**
     * TraceKit.report: cross-browser processing of unhandled exceptions
     *
     * Syntax:
     *   TraceKit.report.subscribe(function(stackInfo) { ... })
     *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
     *   TraceKit.report(exception)
     *   try { ...code... } catch(ex) { TraceKit.report(ex); }
     *
     * Supports:
     *   - Firefox: full stack trace with line numbers, plus column number
     *              on top frame; column number is not guaranteed
     *   - Opera:   full stack trace with line and column numbers
     *   - Chrome:  full stack trace with line and column numbers
     *   - Safari:  line and column number for the top frame only; some frames
     *              may be missing, and column number is not guaranteed
     *   - IE:      line and column number for the top frame only; some frames
     *              may be missing, and column number is not guaranteed
     *
     * In theory, TraceKit should work on all of the following versions:
     *   - IE5.5+ (only 8.0 tested)
     *   - Firefox 0.9+ (only 3.5+ tested)
     *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
     *     Exceptions Have Stacktrace to be enabled in opera:config)
     *   - Safari 3+ (only 4+ tested)
     *   - Chrome 1+ (only 5+ tested)
     *   - Konqueror 3.5+ (untested)
     *
     * Requires TraceKit.computeStackTrace.
     *
     * Tries to catch all unhandled exceptions and report them to the
     * subscribed handlers. Please note that TraceKit.report will rethrow the
     * exception. This is REQUIRED in order to get a useful stack trace in IE.
     * If the exception does not reach the top of the browser, you will only
     * get a stack trace from the point where TraceKit.report was called.
     *
     * Handlers receive a stackInfo object as described in the
     * TraceKit.computeStackTrace docs.
     */
    TraceKit.report = (function reportModuleWrapper() {
        var handlers = [],
            lastArgs = null,
            lastException = null,
            lastExceptionStack = null;

        /**
         * Add a crash handler.
         * @param {Function} handler
         */
        function subscribe(handler) {
            installGlobalHandler();
            handlers.push(handler);
        }

        /**
         * Remove a crash handler.
         * @param {Function} handler
         */
        function unsubscribe(handler) {
            for (var i = handlers.length - 1; i >= 0; --i) {
                if (handlers[i] === handler) {
                    handlers.splice(i, 1);
                }
            }
        }

        /**
         * Remove all crash handlers.
         */
        function unsubscribeAll() {
            uninstallGlobalHandler();
            handlers = [];
        }

        /**
         * Dispatch stack information to all handlers.
         * @param {Object.<string, *>} stack
         */
        function notifyHandlers(stack, isWindowError) {
            var exception = null;
            if (isWindowError && !TraceKit.collectWindowErrors) {
                return;
            }
            for (var i in handlers) {
                if (hasKey(handlers, i)) {
                    try {
                        handlers[i].apply(null, [stack].concat(_slice.call(arguments, 2)));
                    } catch (inner) {
                        exception = inner;
                    }
                }
            }

            if (exception) {
                throw exception;
            }
        }

        var _oldOnerrorHandler, _onErrorHandlerInstalled;

        /**
         * Ensures all global unhandled exceptions are recorded.
         * Supported by Gecko and IE.
         * @param {string} message Error message.
         * @param {string} url URL of script that generated the exception.
         * @param {(number|string)} lineNo The line number at which the error
         * occurred.
         * @param {?(number|string)} colNo The column number at which the error
         * occurred.
         * @param {?Error} ex The actual Error object.
         */
        function traceKitWindowOnError(message, url, lineNo, colNo, ex) {
            var stack = null;

            if (lastExceptionStack) {
                TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
                processLastException();
            } else if (ex) {
                // New chrome and blink send along a real error object
                // Let's just report that like a normal error.
                // See: https://mikewest.org/2013/08/debugging-runtime-errors-with-window-onerror
                stack = TraceKit.computeStackTrace(ex);
                notifyHandlers(stack, true);
            } else {
                var location = {
                    'url': url,
                    'line': lineNo,
                    'column': colNo
                };
                location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
                location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
                stack = {
                    'message': message,
                    'url': getLocationHref(),
                    'stack': [location]
                };
                notifyHandlers(stack, true);
            }

            if (_oldOnerrorHandler) {
                return _oldOnerrorHandler.apply(this, arguments);
            }

            return false;
        }

        function installGlobalHandler() {
            if (_onErrorHandlerInstalled) {
                return;
            }
            _oldOnerrorHandler = window.onerror;
            window.onerror = traceKitWindowOnError;
            _onErrorHandlerInstalled = true;
        }

        function uninstallGlobalHandler() {
            if (!_onErrorHandlerInstalled) {
                return;
            }
            window.onerror = _oldOnerrorHandler;
            _onErrorHandlerInstalled = false;
            _oldOnerrorHandler = undefined;
        }

        function processLastException() {
            var _lastExceptionStack = lastExceptionStack,
                _lastArgs = lastArgs;
            lastArgs = null;
            lastExceptionStack = null;
            lastException = null;
            notifyHandlers.apply(null, [_lastExceptionStack, false].concat(_lastArgs));
        }

        /**
         * Reports an unhandled Error to TraceKit.
         * @param {Error} ex
         * @param {?boolean} rethrow If false, do not re-throw the exception.
         * Only used for window.onerror to not cause an infinite loop of
         * rethrowing.
         */
        function report(ex, rethrow) {
            var args = _slice.call(arguments, 1);
            if (lastExceptionStack) {
                if (lastException === ex) {
                    return; // already caught by an inner catch block, ignore
                } else {
                        processLastException();
                    }
            }

            var stack = TraceKit.computeStackTrace(ex);
            lastExceptionStack = stack;
            lastException = ex;
            lastArgs = args;

            // If the stack trace is incomplete, wait for 2 seconds for
            // slow slow IE to see if onerror occurs or not before reporting
            // this exception; otherwise, we will end up with an incomplete
            // stack trace
            window.setTimeout(function () {
                if (lastException === ex) {
                    processLastException();
                }
            }, stack.incomplete ? 2000 : 0);

            if (rethrow !== false) {
                throw ex; // re-throw to propagate to the top level (and cause window.onerror)
            }
        }

        report.subscribe = subscribe;
        report.unsubscribe = unsubscribe;
        report.uninstall = unsubscribeAll;
        return report;
    })();

    /**
     * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
     *
     * Syntax:
     *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
     * Returns:
     *   s.name              - exception name
     *   s.message           - exception message
     *   s.stack[i].url      - JavaScript or HTML file URL
     *   s.stack[i].func     - function name, or empty for anonymous functions (if guessing did not work)
     *   s.stack[i].args     - arguments passed to the function, if known
     *   s.stack[i].line     - line number, if known
     *   s.stack[i].column   - column number, if known
     *   s.stack[i].context  - an array of source code lines; the middle element corresponds to the correct line#
     *
     * Supports:
     *   - Firefox:  full stack trace with line numbers and unreliable column
     *               number on top frame
     *   - Opera 10: full stack trace with line and column numbers
     *   - Opera 9-: full stack trace with line numbers
     *   - Chrome:   full stack trace with line and column numbers
     *   - Safari:   line and column number for the topmost stacktrace element
     *               only
     *   - IE:       no line numbers whatsoever
     *
     * Tries to guess names of anonymous functions by looking for assignments
     * in the source code. In IE and Safari, we have to guess source file names
     * by searching for function bodies inside all page scripts. This will not
     * work for scripts that are loaded cross-domain.
     * Here be dragons: some function names may be guessed incorrectly, and
     * duplicate functions may be mismatched.
     *
     * TraceKit.computeStackTrace should only be used for tracing purposes.
     * Logging of unhandled exceptions should be done with TraceKit.report,
     * which builds on top of TraceKit.computeStackTrace and provides better
     * IE support by utilizing the window.onerror event to retrieve information
     * about the top of the stack.
     *
     * Note: In IE and Safari, no stack trace is recorded on the Error object,
     * so computeStackTrace instead walks its *own* chain of callers.
     * This means that:
     *  * in Safari, some methods may be missing from the stack trace;
     *  * in IE, the topmost function in the stack trace will always be the
     *    caller of computeStackTrace.
     *
     * This is okay for tracing (because you are likely to be calling
     * computeStackTrace from the function you want to be the topmost element
     * of the stack trace anyway), but not okay for logging unhandled
     * exceptions (because your catch block will likely be far away from the
     * inner function that actually caused the exception).
     *
     */
    TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
        var sourceCache = {};

        /**
         * Attempts to retrieve source code via XMLHttpRequest, which is used
         * to look up anonymous function names.
         * @param {string} url URL of source code.
         * @return {string} Source contents.
         */
        function loadSource(url) {
            if (!TraceKit.remoteFetching) {
                //Only attempt request if remoteFetching is on.
                return '';
            }
            try {
                var getXHR = function getXHR() {
                    try {
                        return new window.XMLHttpRequest();
                    } catch (e) {
                        // explicitly bubble up the exception if not found
                        return new window.ActiveXObject('Microsoft.XMLHTTP');
                    }
                };

                var request = getXHR();
                request.open('GET', url, false);
                request.send('');
                return request.responseText;
            } catch (e) {
                return '';
            }
        }

        /**
         * Retrieves source code from the source code cache.
         * @param {string} url URL of source code.
         * @return {Array.<string>} Source contents.
         */
        function getSource(url) {
            if (!isString(url)) return [];
            if (!hasKey(sourceCache, url)) {
                // URL needs to be able to fetched within the acceptable domain.  Otherwise,
                // cross-domain errors will be triggered.
                var source = '';
                var domain = '';
                try {
                    domain = document.domain;
                } catch (e) {}
                if (url.indexOf(domain) !== -1) {
                    source = loadSource(url);
                }
                sourceCache[url] = source ? source.split('\n') : [];
            }

            return sourceCache[url];
        }

        /**
         * Tries to use an externally loaded copy of source code to determine
         * the name of a function by looking at the name of the variable it was
         * assigned to, if any.
         * @param {string} url URL of source code.
         * @param {(string|number)} lineNo Line number in source code.
         * @return {string} The function name, if discoverable.
         */
        function guessFunctionName(url, lineNo) {
            var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/,
                reGuessFunction = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
                line = '',
                maxLines = 10,
                source = getSource(url),
                m;

            if (!source.length) {
                return UNKNOWN_FUNCTION;
            }

            // Walk backwards from the first line in the function until we find the line which
            // matches the pattern above, which is the function definition
            for (var i = 0; i < maxLines; ++i) {
                line = source[lineNo - i] + line;

                if (!isUndefined(line)) {
                    if (m = reGuessFunction.exec(line)) {
                        return m[1];
                    } else if (m = reFunctionArgNames.exec(line)) {
                        return m[1];
                    }
                }
            }

            return UNKNOWN_FUNCTION;
        }

        /**
         * Retrieves the surrounding lines from where an exception occurred.
         * @param {string} url URL of source code.
         * @param {(string|number)} line Line number in source code to centre
         * around for context.
         * @return {?Array.<string>} Lines of source code.
         */
        function gatherContext(url, line) {
            var source = getSource(url);

            if (!source.length) {
                return null;
            }

            var context = [],

            // linesBefore & linesAfter are inclusive with the offending line.
            // if linesOfContext is even, there will be one extra line
            //   *before* the offending line.
            linesBefore = Math.floor(TraceKit.linesOfContext / 2),

            // Add one extra line if linesOfContext is odd
            linesAfter = linesBefore + TraceKit.linesOfContext % 2,
                start = Math.max(0, line - linesBefore - 1),
                end = Math.min(source.length, line + linesAfter - 1);

            line -= 1; // convert to 0-based index

            for (var i = start; i < end; ++i) {
                if (!isUndefined(source[i])) {
                    context.push(source[i]);
                }
            }

            return context.length > 0 ? context : null;
        }

        /**
         * Escapes special characters, except for whitespace, in a string to be
         * used inside a regular expression as a string literal.
         * @param {string} text The string.
         * @return {string} The escaped string literal.
         */
        function escapeRegExp(text) {
            return text.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, '\\$&');
        }

        /**
         * Escapes special characters in a string to be used inside a regular
         * expression as a string literal. Also ensures that HTML entities will
         * be matched the same as their literal friends.
         * @param {string} body The string.
         * @return {string} The escaped string.
         */
        function escapeCodeAsRegExpForMatchingInsideHTML(body) {
            return escapeRegExp(body).replace('<', '(?:<|&lt;)').replace('>', '(?:>|&gt;)').replace('&', '(?:&|&amp;)').replace('"', '(?:"|&quot;)').replace(/\s+/g, '\\s+');
        }

        /**
         * Determines where a code fragment occurs in the source code.
         * @param {RegExp} re The function definition.
         * @param {Array.<string>} urls A list of URLs to search.
         * @return {?Object.<string, (string|number)>} An object containing
         * the url, line, and column number of the defined function.
         */
        function findSourceInUrls(re, urls) {
            var source, m;
            for (var i = 0, j = urls.length; i < j; ++i) {
                // console.log('searching', urls[i]);
                if ((source = getSource(urls[i])).length) {
                    source = source.join('\n');
                    if (m = re.exec(source)) {
                        // console.log('Found function in ' + urls[i]);

                        return {
                            'url': urls[i],
                            'line': source.substring(0, m.index).split('\n').length,
                            'column': m.index - source.lastIndexOf('\n', m.index) - 1
                        };
                    }
                }
            }

            // console.log('no match');

            return null;
        }

        /**
         * Determines at which column a code fragment occurs on a line of the
         * source code.
         * @param {string} fragment The code fragment.
         * @param {string} url The URL to search.
         * @param {(string|number)} line The line number to examine.
         * @return {?number} The column number.
         */
        function findSourceInLine(fragment, url, line) {
            var source = getSource(url),
                re = new RegExp('\\b' + escapeRegExp(fragment) + '\\b'),
                m;

            line -= 1;

            if (source && source.length > line && (m = re.exec(source[line]))) {
                return m.index;
            }

            return null;
        }

        /**
         * Determines where a function was defined within the source code.
         * @param {(Function|string)} func A function reference or serialized
         * function definition.
         * @return {?Object.<string, (string|number)>} An object containing
         * the url, line, and column number of the defined function.
         */
        function findSourceByFunctionBody(func) {
            if (typeof document === 'undefined') return;

            var urls = [window.location.href],
                scripts = document.getElementsByTagName('script'),
                body,
                code = '' + func,
                codeRE = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
                eventRE = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
                re,
                parts,
                result;

            for (var i = 0; i < scripts.length; ++i) {
                var script = scripts[i];
                if (script.src) {
                    urls.push(script.src);
                }
            }

            if (!(parts = codeRE.exec(code))) {
                re = new RegExp(escapeRegExp(code).replace(/\s+/g, '\\s+'));
            }

            // not sure if this is really necessary, but I don’t have a test
            // corpus large enough to confirm that and it was in the original.
            else {
                    var name = parts[1] ? '\\s+' + parts[1] : '',
                        args = parts[2].split(',').join('\\s*,\\s*');

                    body = escapeRegExp(parts[3]).replace(/;$/, ';?'); // semicolon is inserted if the function ends with a comment.replace(/\s+/g, '\\s+');
                    re = new RegExp('function' + name + '\\s*\\(\\s*' + args + '\\s*\\)\\s*{\\s*' + body + '\\s*}');
                }

            // look for a normal function definition
            if (result = findSourceInUrls(re, urls)) {
                return result;
            }

            // look for an old-school event handler function
            if (parts = eventRE.exec(code)) {
                var event = parts[1];
                body = escapeCodeAsRegExpForMatchingInsideHTML(parts[2]);

                // look for a function defined in HTML as an onXXX handler
                re = new RegExp('on' + event + '=[\\\'"]\\s*' + body + '\\s*[\\\'"]', 'i');

                if (result = findSourceInUrls(re, urls[0])) {
                    return result;
                }

                // look for ???
                re = new RegExp(body);

                if (result = findSourceInUrls(re, urls)) {
                    return result;
                }
            }

            return null;
        }

        // Contents of Exception in various browsers.
        //
        // SAFARI:
        // ex.message = Can't find variable: qq
        // ex.line = 59
        // ex.sourceId = 580238192
        // ex.sourceURL = http://...
        // ex.expressionBeginOffset = 96
        // ex.expressionCaretOffset = 98
        // ex.expressionEndOffset = 98
        // ex.name = ReferenceError
        //
        // FIREFOX:
        // ex.message = qq is not defined
        // ex.fileName = http://...
        // ex.lineNumber = 59
        // ex.columnNumber = 69
        // ex.stack = ...stack trace... (see the example below)
        // ex.name = ReferenceError
        //
        // CHROME:
        // ex.message = qq is not defined
        // ex.name = ReferenceError
        // ex.type = not_defined
        // ex.arguments = ['aa']
        // ex.stack = ...stack trace...
        //
        // INTERNET EXPLORER:
        // ex.message = ...
        // ex.name = ReferenceError
        //
        // OPERA:
        // ex.message = ...message... (see the example below)
        // ex.name = ReferenceError
        // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
        // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

        /**
         * Computes stack trace information from the stack property.
         * Chrome and Gecko use this property.
         * @param {Error} ex
         * @return {?Object.<string, *>} Stack trace information.
         */
        function computeStackTraceFromStackProp(ex) {
            if (isUndefined(ex.stack) || !ex.stack) return;

            var chrome = /^\s*at (.*?) ?\(?((?:(?:file|https?|chrome-extension):.*?)|<anonymous>):(\d+)(?::(\d+))?\)?\s*$/i,
                gecko = /^\s*(.*?)(?:\((.*?)\))?@((?:file|https?|chrome).*?):(\d+)(?::(\d+))?\s*$/i,
                winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:ms-appx|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                lines = ex.stack.split('\n'),
                stack = [],
                parts,
                element,
                reference = /^(.*) is undefined$/.exec(ex.message);

            for (var i = 0, j = lines.length; i < j; ++i) {
                if (parts = gecko.exec(lines[i])) {
                    element = {
                        'url': parts[3],
                        'func': parts[1] || UNKNOWN_FUNCTION,
                        'args': parts[2] ? parts[2].split(',') : '',
                        'line': +parts[4],
                        'column': parts[5] ? +parts[5] : null
                    };
                } else if (parts = chrome.exec(lines[i])) {
                    element = {
                        'url': parts[2],
                        'func': parts[1] || UNKNOWN_FUNCTION,
                        'line': +parts[3],
                        'column': parts[4] ? +parts[4] : null
                    };
                } else if (parts = winjs.exec(lines[i])) {
                    element = {
                        'url': parts[2],
                        'func': parts[1] || UNKNOWN_FUNCTION,
                        'line': +parts[3],
                        'column': parts[4] ? +parts[4] : null
                    };
                } else {
                    continue;
                }

                if (!element.func && element.line) {
                    element.func = guessFunctionName(element.url, element.line);
                }

                if (element.line) {
                    element.context = gatherContext(element.url, element.line);
                }

                stack.push(element);
            }

            if (!stack.length) {
                return null;
            }

            if (stack[0].line && !stack[0].column && reference) {
                stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
            } else if (!stack[0].column && !isUndefined(ex.columnNumber)) {
                // FireFox uses this awesome columnNumber property for its top frame
                // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                // so adding 1
                stack[0].column = ex.columnNumber + 1;
            }

            return {
                'name': ex.name,
                'message': ex.message,
                'url': getLocationHref(),
                'stack': stack
            };
        }

        /**
         * Computes stack trace information from the stacktrace property.
         * Opera 10 uses this property.
         * @param {Error} ex
         * @return {?Object.<string, *>} Stack trace information.
         */
        function computeStackTraceFromStacktraceProp(ex) {
            // Access and store the stacktrace property before doing ANYTHING
            // else to it because Opera is not very good at providing it
            // reliably in other circumstances.
            var stacktrace = ex.stacktrace;
            if (isUndefined(ex.stacktrace) || !ex.stacktrace) return;

            var testRE = / line (\d+), column (\d+) in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\) in (.*):\s*$/i,
                lines = stacktrace.split('\n'),
                stack = [],
                parts;

            for (var i = 0, j = lines.length; i < j; i += 2) {
                if (parts = testRE.exec(lines[i])) {
                    var element = {
                        'line': +parts[1],
                        'column': +parts[2],
                        'func': parts[3] || parts[4],
                        'args': parts[5] ? parts[5].split(',') : [],
                        'url': parts[6]
                    };

                    if (!element.func && element.line) {
                        element.func = guessFunctionName(element.url, element.line);
                    }
                    if (element.line) {
                        try {
                            element.context = gatherContext(element.url, element.line);
                        } catch (exc) {}
                    }

                    if (!element.context) {
                        element.context = [lines[i + 1]];
                    }

                    stack.push(element);
                }
            }

            if (!stack.length) {
                return null;
            }

            return {
                'name': ex.name,
                'message': ex.message,
                'url': getLocationHref(),
                'stack': stack
            };
        }

        /**
         * NOT TESTED.
         * Computes stack trace information from an error message that includes
         * the stack trace.
         * Opera 9 and earlier use this method if the option to show stack
         * traces is turned on in opera:config.
         * @param {Error} ex
         * @return {?Object.<string, *>} Stack information.
         */
        function computeStackTraceFromOperaMultiLineMessage(ex) {
            // Opera includes a stack trace into the exception message. An example is:
            //
            // Statement on line 3: Undefined variable: undefinedFunc
            // Backtrace:
            //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
            //         undefinedFunc(a);
            //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
            //           zzz(x, y, z);
            //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
            //           yyy(a, a, a);
            //   Line 1 of function script
            //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
            //   ...

            var lines = ex.message.split('\n');
            if (lines.length < 4) {
                return null;
            }

            var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i,
                lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i,
                lineRE3 = /^\s*Line (\d+) of function script\s*$/i,
                stack = [],
                scripts = document.getElementsByTagName('script'),
                inlineScriptBlocks = [],
                parts,
                i,
                len,
                source;

            for (i in scripts) {
                if (hasKey(scripts, i) && !scripts[i].src) {
                    inlineScriptBlocks.push(scripts[i]);
                }
            }

            for (i = 2, len = lines.length; i < len; i += 2) {
                var item = null;
                if (parts = lineRE1.exec(lines[i])) {
                    item = {
                        'url': parts[2],
                        'func': parts[3],
                        'line': +parts[1]
                    };
                } else if (parts = lineRE2.exec(lines[i])) {
                    item = {
                        'url': parts[3],
                        'func': parts[4]
                    };
                    var relativeLine = +parts[1]; // relative to the start of the <SCRIPT> block
                    var script = inlineScriptBlocks[parts[2] - 1];
                    if (script) {
                        source = getSource(item.url);
                        if (source) {
                            source = source.join('\n');
                            var pos = source.indexOf(script.innerText);
                            if (pos >= 0) {
                                item.line = relativeLine + source.substring(0, pos).split('\n').length;
                            }
                        }
                    }
                } else if (parts = lineRE3.exec(lines[i])) {
                    var url = window.location.href.replace(/#.*$/, ''),
                        line = parts[1];
                    var re = new RegExp(escapeCodeAsRegExpForMatchingInsideHTML(lines[i + 1]));
                    source = findSourceInUrls(re, [url]);
                    item = {
                        'url': url,
                        'line': source ? source.line : line,
                        'func': ''
                    };
                }

                if (item) {
                    if (!item.func) {
                        item.func = guessFunctionName(item.url, item.line);
                    }
                    var context = gatherContext(item.url, item.line);
                    var midline = context ? context[Math.floor(context.length / 2)] : null;
                    if (context && midline.replace(/^\s*/, '') === lines[i + 1].replace(/^\s*/, '')) {
                        item.context = context;
                    } else {
                        // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                        item.context = [lines[i + 1]];
                    }
                    stack.push(item);
                }
            }
            if (!stack.length) {
                return null; // could not parse multiline exception message as Opera stack trace
            }

            return {
                'name': ex.name,
                'message': lines[0],
                'url': getLocationHref(),
                'stack': stack
            };
        }

        /**
         * Adds information about the first frame to incomplete stack traces.
         * Safari and IE require this to get complete data on the first frame.
         * @param {Object.<string, *>} stackInfo Stack trace information from
         * one of the compute* methods.
         * @param {string} url The URL of the script that caused an error.
         * @param {(number|string)} lineNo The line number of the script that
         * caused an error.
         * @param {string=} message The error generated by the browser, which
         * hopefully contains the name of the object that caused the error.
         * @return {boolean} Whether or not the stack information was
         * augmented.
         */
        function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
            var initial = {
                'url': url,
                'line': lineNo
            };

            if (initial.url && initial.line) {
                stackInfo.incomplete = false;

                if (!initial.func) {
                    initial.func = guessFunctionName(initial.url, initial.line);
                }

                if (!initial.context) {
                    initial.context = gatherContext(initial.url, initial.line);
                }

                var reference = / '([^']+)' /.exec(message);
                if (reference) {
                    initial.column = findSourceInLine(reference[1], initial.url, initial.line);
                }

                if (stackInfo.stack.length > 0) {
                    if (stackInfo.stack[0].url === initial.url) {
                        if (stackInfo.stack[0].line === initial.line) {
                            return false; // already in stack trace
                        } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                                stackInfo.stack[0].line = initial.line;
                                stackInfo.stack[0].context = initial.context;
                                return false;
                            }
                    }
                }

                stackInfo.stack.unshift(initial);
                stackInfo.partial = true;
                return true;
            } else {
                stackInfo.incomplete = true;
            }

            return false;
        }

        /**
         * Computes stack trace information by walking the arguments.caller
         * chain at the time the exception occurred. This will cause earlier
         * frames to be missed but is the only way to get any stack trace in
         * Safari and IE. The top frame is restored by
         * {@link augmentStackTraceWithInitialElement}.
         * @param {Error} ex
         * @return {?Object.<string, *>} Stack trace information.
         */
        function computeStackTraceByWalkingCallerChain(ex, depth) {
            var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
                stack = [],
                funcs = {},
                recursion = false,
                parts,
                item,
                source;

            for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
                if (curr === computeStackTrace || curr === TraceKit.report) {
                    // console.log('skipping internal function');
                    continue;
                }

                item = {
                    'url': null,
                    'func': UNKNOWN_FUNCTION,
                    'line': null,
                    'column': null
                };

                if (curr.name) {
                    item.func = curr.name;
                } else if (parts = functionName.exec(curr.toString())) {
                    item.func = parts[1];
                }

                if (typeof item.func === 'undefined') {
                    try {
                        item.func = parts.input.substring(0, parts.input.indexOf('{'));
                    } catch (e) {}
                }

                if (source = findSourceByFunctionBody(curr)) {
                    item.url = source.url;
                    item.line = source.line;

                    if (item.func === UNKNOWN_FUNCTION) {
                        item.func = guessFunctionName(item.url, item.line);
                    }

                    var reference = / '([^']+)' /.exec(ex.message || ex.description);
                    if (reference) {
                        item.column = findSourceInLine(reference[1], source.url, source.line);
                    }
                }

                if (funcs['' + curr]) {
                    recursion = true;
                } else {
                    funcs['' + curr] = true;
                }

                stack.push(item);
            }

            if (depth) {
                // console.log('depth is ' + depth);
                // console.log('stack is ' + stack.length);
                stack.splice(0, depth);
            }

            var result = {
                'name': ex.name,
                'message': ex.message,
                'url': getLocationHref(),
                'stack': stack
            };
            augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
            return result;
        }

        /**
         * Computes a stack trace for an exception.
         * @param {Error} ex
         * @param {(string|number)=} depth
         */
        function computeStackTrace(ex, depth) {
            var stack = null;
            depth = depth == null ? 0 : +depth;

            try {
                // This must be tried first because Opera 10 *destroys*
                // its stacktrace property if you try to access the stack
                // property first!!
                stack = computeStackTraceFromStacktraceProp(ex);
                if (stack) {
                    return stack;
                }
            } catch (e) {
                if (TraceKit.debug) {
                    throw e;
                }
            }

            try {
                stack = computeStackTraceFromStackProp(ex);
                if (stack) {
                    return stack;
                }
            } catch (e) {
                if (TraceKit.debug) {
                    throw e;
                }
            }

            try {
                stack = computeStackTraceFromOperaMultiLineMessage(ex);
                if (stack) {
                    return stack;
                }
            } catch (e) {
                if (TraceKit.debug) {
                    throw e;
                }
            }

            try {
                stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
                if (stack) {
                    return stack;
                }
            } catch (e) {
                if (TraceKit.debug) {
                    throw e;
                }
            }

            return {
                'name': ex.name,
                'message': ex.message,
                'url': getLocationHref()
            };
        }

        computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
        computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;
        computeStackTrace.guessFunctionName = guessFunctionName;
        computeStackTrace.gatherContext = gatherContext;

        return computeStackTrace;
    })();

    'use strict';

    // First, check for JSON support
    // If there is no JSON, we no-op the core features of Raven
    // since JSON is required to encode the payload
    var _Raven = window.Raven,
        hasJSON = !!((typeof JSON === 'undefined' ? 'undefined' : _typeof(JSON)) === 'object' && JSON.stringify),

    // Raven can run in contexts where there's no document (react-native)
    hasDocument = typeof document !== 'undefined',
        lastCapturedException,
        _lastEventId,
        globalServer,
        globalKey,
        globalProject,
        globalContext = {},
        globalOptions = {
        logger: 'javascript',
        ignoreErrors: [],
        ignoreUrls: [],
        whitelistUrls: [],
        includePaths: [],
        crossOrigin: 'anonymous',
        collectWindowErrors: true,
        maxMessageLength: 100
    },
        isRavenInstalled = false,
        objectPrototype = Object.prototype,

    // capture references to window.console *and* all its methods first
    // before the console plugin has a chance to monkey patch
    originalConsole = window.console || {},
        originalConsoleMethods = {},
        plugins = [],
        startTime = now();

    for (var method in originalConsole) {
        originalConsoleMethods[method] = originalConsole[method];
    }
    /*
     * The core Raven singleton
     *
     * @this {Raven}
     */
    var Raven = {
        VERSION: '1.3.0',

        debug: false,

        /*
         * Allow multiple versions of Raven to be installed.
         * Strip Raven from the global context and returns the instance.
         *
         * @return {Raven}
         */
        noConflict: function noConflict() {
            window.Raven = _Raven;
            return Raven;
        },

        /*
         * Configure Raven with a DSN and extra options
         *
         * @param {string} dsn The public Sentry DSN
         * @param {object} options Optional set of of global options [optional]
         * @return {Raven}
         */
        config: function config(dsn, options) {
            if (globalServer) {
                logDebug('error', 'Error: Raven has already been configured');
                return Raven;
            }
            if (!dsn) return Raven;

            var uri = parseDSN(dsn),
                lastSlash = uri.path.lastIndexOf('/'),
                path = uri.path.substr(1, lastSlash);

            // merge in options
            if (options) {
                each(options, function (key, value) {
                    // tags and extra are special and need to be put into context
                    if (key == 'tags' || key == 'extra') {
                        globalContext[key] = value;
                    } else {
                        globalOptions[key] = value;
                    }
                });
            }

            // "Script error." is hard coded into browsers for errors that it can't read.
            // this is the result of a script being pulled in from an external domain and CORS.
            globalOptions.ignoreErrors.push(/^Script error\.?$/);
            globalOptions.ignoreErrors.push(/^Javascript error: Script error\.? on line 0$/);

            // join regexp rules into one big rule
            globalOptions.ignoreErrors = joinRegExp(globalOptions.ignoreErrors);
            globalOptions.ignoreUrls = globalOptions.ignoreUrls.length ? joinRegExp(globalOptions.ignoreUrls) : false;
            globalOptions.whitelistUrls = globalOptions.whitelistUrls.length ? joinRegExp(globalOptions.whitelistUrls) : false;
            globalOptions.includePaths = joinRegExp(globalOptions.includePaths);

            globalKey = uri.user;
            globalProject = uri.path.substr(lastSlash + 1);

            // assemble the endpoint from the uri pieces
            globalServer = '//' + uri.host + (uri.port ? ':' + uri.port : '') + '/' + path + 'api/' + globalProject + '/store/';

            if (uri.protocol) {
                globalServer = uri.protocol + ':' + globalServer;
            }

            if (globalOptions.fetchContext) {
                TraceKit.remoteFetching = true;
            }

            if (globalOptions.linesOfContext) {
                TraceKit.linesOfContext = globalOptions.linesOfContext;
            }

            TraceKit.collectWindowErrors = !!globalOptions.collectWindowErrors;

            // return for chaining
            return Raven;
        },

        /*
         * Installs a global window.onerror error handler
         * to capture and report uncaught exceptions.
         * At this point, install() is required to be called due
         * to the way TraceKit is set up.
         *
         * @return {Raven}
         */
        install: function install() {
            if (_isSetup() && !isRavenInstalled) {
                TraceKit.report.subscribe(handleStackInfo);

                // Install all of the plugins
                each(plugins, function (_, plugin) {
                    plugin();
                });

                isRavenInstalled = true;
            }

            return Raven;
        },

        /*
         * Wrap code within a context so Raven can capture errors
         * reliably across domains that is executed immediately.
         *
         * @param {object} options A specific set of options for this context [optional]
         * @param {function} func The callback to be immediately executed within the context
         * @param {array} args An array of arguments to be called with the callback [optional]
         */
        context: function context(options, func, args) {
            if (isFunction(options)) {
                args = func || [];
                func = options;
                options = undefined;
            }

            return Raven.wrap(options, func).apply(this, args);
        },

        /*
         * Wrap code within a context and returns back a new function to be executed
         *
         * @param {object} options A specific set of options for this context [optional]
         * @param {function} func The function to be wrapped in a new context
         * @return {function} The newly wrapped functions with a context
         */
        wrap: function wrap(options, func) {
            // 1 argument has been passed, and it's not a function
            // so just return it
            if (isUndefined(func) && !isFunction(options)) {
                return options;
            }

            // options is optional
            if (isFunction(options)) {
                func = options;
                options = undefined;
            }

            // At this point, we've passed along 2 arguments, and the second one
            // is not a function either, so we'll just return the second argument.
            if (!isFunction(func)) {
                return func;
            }

            // We don't wanna wrap it twice!
            if (func.__raven__) {
                return func;
            }

            function wrapped() {
                var args = [],
                    i = arguments.length,
                    deep = !options || options && options.deep !== false;
                // Recursively wrap all of a function's arguments that are
                // functions themselves.

                while (i--) {
                    args[i] = deep ? Raven.wrap(options, arguments[i]) : arguments[i];
                }try {
                    /*jshint -W040*/
                    return func.apply(this, args);
                } catch (e) {
                    Raven.captureException(e, options);
                    throw e;
                }
            }

            // copy over properties of the old function
            for (var property in func) {
                if (hasKey(func, property)) {
                    wrapped[property] = func[property];
                }
            }
            wrapped.prototype = func.prototype;

            // Signal that this function has been wrapped already
            // for both debugging and to prevent it to being wrapped twice
            wrapped.__raven__ = true;
            wrapped.__inner__ = func;

            return wrapped;
        },

        /*
         * Uninstalls the global error handler.
         *
         * @return {Raven}
         */
        uninstall: function uninstall() {
            TraceKit.report.uninstall();
            isRavenInstalled = false;

            return Raven;
        },

        /*
         * Manually capture an exception and send it over to Sentry
         *
         * @param {error} ex An exception to be logged
         * @param {object} options A specific set of options for this error [optional]
         * @return {Raven}
         */
        captureException: function captureException(ex, options) {
            // If not an Error is passed through, recall as a message instead
            if (!isError(ex)) return Raven.captureMessage(ex, options);

            // Store the raw exception object for potential debugging and introspection
            lastCapturedException = ex;

            // TraceKit.report will re-raise any exception passed to it,
            // which means you have to wrap it in try/catch. Instead, we
            // can wrap it here and only re-raise if TraceKit.report
            // raises an exception different from the one we asked to
            // report on.
            try {
                var stack = TraceKit.computeStackTrace(ex);
                handleStackInfo(stack, options);
            } catch (ex1) {
                if (ex !== ex1) {
                    throw ex1;
                }
            }

            return Raven;
        },

        /*
         * Manually send a message to Sentry
         *
         * @param {string} msg A plain message to be captured in Sentry
         * @param {object} options A specific set of options for this message [optional]
         * @return {Raven}
         */
        captureMessage: function captureMessage(msg, options) {
            // config() automagically converts ignoreErrors from a list to a RegExp so we need to test for an
            // early call; we'll error on the side of logging anything called before configuration since it's
            // probably something you should see:
            if (!!globalOptions.ignoreErrors.test && globalOptions.ignoreErrors.test(msg)) {
                return;
            }

            // Fire away!
            send(objectMerge({
                message: msg + '' // Make sure it's actually a string
            }, options));

            return Raven;
        },

        addPlugin: function addPlugin(plugin) {
            plugins.push(plugin);
            if (isRavenInstalled) plugin();
            return Raven;
        },

        /*
         * Set/clear a user to be sent along with the payload.
         *
         * @param {object} user An object representing user data [optional]
         * @return {Raven}
         */
        setUserContext: function setUserContext(user) {
            // Intentionally do not merge here since that's an unexpected behavior.
            globalContext.user = user;

            return Raven;
        },

        /*
         * Merge extra attributes to be sent along with the payload.
         *
         * @param {object} extra An object representing extra data [optional]
         * @return {Raven}
         */
        setExtraContext: function setExtraContext(extra) {
            mergeContext('extra', extra);

            return Raven;
        },

        /*
         * Merge tags to be sent along with the payload.
         *
         * @param {object} tags An object representing tags [optional]
         * @return {Raven}
         */
        setTagsContext: function setTagsContext(tags) {
            mergeContext('tags', tags);

            return Raven;
        },

        /*
         * Clear all of the context.
         *
         * @return {Raven}
         */
        clearContext: function clearContext() {
            globalContext = {};

            return Raven;
        },

        /*
         * Get a copy of the current context. This cannot be mutated.
         *
         * @return {object} copy of context
         */
        getContext: function getContext() {
            // lol javascript
            return JSON.parse(JSON.stringify(globalContext));
        },

        /*
         * Set release version of application
         *
         * @param {string} release Typically something like a git SHA to identify version
         * @return {Raven}
         */
        setRelease: function setRelease(release) {
            globalOptions.release = release;

            return Raven;
        },

        /*
         * Set the dataCallback option
         *
         * @param {function} callback The callback to run which allows the
         *                            data blob to be mutated before sending
         * @return {Raven}
         */
        setDataCallback: function setDataCallback(callback) {
            globalOptions.dataCallback = callback;

            return Raven;
        },

        /*
         * Set the shouldSendCallback option
         *
         * @param {function} callback The callback to run which allows
         *                            introspecting the blob before sending
         * @return {Raven}
         */
        setShouldSendCallback: function setShouldSendCallback(callback) {
            globalOptions.shouldSendCallback = callback;

            return Raven;
        },

        /**
         * Override the default HTTP transport mechanism that transmits data
         * to the Sentry server.
         *
         * @param {function} transport Function invoked instead of the default
         *                             `makeRequest` handler.
         *
         * @return {Raven}
         */
        setTransport: function setTransport(transport) {
            globalOptions.transport = transport;

            return Raven;
        },

        /*
         * Get the latest raw exception that was captured by Raven.
         *
         * @return {error}
         */
        lastException: function lastException() {
            return lastCapturedException;
        },

        /*
         * Get the last event id
         *
         * @return {string}
         */
        lastEventId: function lastEventId() {
            return _lastEventId;
        },

        /*
         * Determine if Raven is setup and ready to go.
         *
         * @return {boolean}
         */
        isSetup: function isSetup() {
            return _isSetup();
        }
    };

    // Deprecations
    Raven.setUser = Raven.setUserContext;
    Raven.setReleaseContext = Raven.setRelease;

    function triggerEvent(eventType, options) {
        // NOTE: `event` is a native browser thing, so let's avoid conflicting wiht it
        var evt, key;

        if (!hasDocument) return;

        options = options || {};

        eventType = 'raven' + eventType.substr(0, 1).toUpperCase() + eventType.substr(1);

        if (document.createEvent) {
            evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventType, true, true);
        } else {
            evt = document.createEventObject();
            evt.eventType = eventType;
        }

        for (key in options) {
            if (hasKey(options, key)) {
                evt[key] = options[key];
            }
        }if (document.createEvent) {
            // IE9 if standards
            document.dispatchEvent(evt);
        } else {
            // IE8 regardless of Quirks or Standards
            // IE9 if quirks
            try {
                document.fireEvent('on' + evt.eventType.toLowerCase(), evt);
            } catch (e) {}
        }
    }

    var dsnKeys = 'source protocol user pass host port path'.split(' '),
        dsnPattern = /^(?:(\w+):)?\/\/(?:(\w+)(:\w+)?@)?([\w\.-]+)(?::(\d+))?(\/.*)/;

    function RavenConfigError(message) {
        this.name = 'RavenConfigError';
        this.message = message;
    }
    RavenConfigError.prototype = new Error();
    RavenConfigError.prototype.constructor = RavenConfigError;

    /**** Private functions ****/
    function parseDSN(str) {
        var m = dsnPattern.exec(str),
            dsn = {},
            i = 7;

        try {
            while (i--) {
                dsn[dsnKeys[i]] = m[i] || '';
            }
        } catch (e) {
            throw new RavenConfigError('Invalid DSN: ' + str);
        }

        if (dsn.pass) throw new RavenConfigError('Do not specify your private key in the DSN!');

        return dsn;
    }

    function isUndefined(what) {
        return what === void 0;
    }

    function isFunction(what) {
        return typeof what === 'function';
    }

    function isString(what) {
        return objectPrototype.toString.call(what) === '[object String]';
    }

    function isObject(what) {
        return (typeof what === 'undefined' ? 'undefined' : _typeof(what)) === 'object' && what !== null;
    }

    function isEmptyObject(what) {
        for (var k in what) {
            return false;
        }return true;
    }

    // Sorta yanked from https://github.com/joyent/node/blob/aa3b4b4/lib/util.js#L560
    // with some tiny modifications
    function isError(what) {
        return isObject(what) && objectPrototype.toString.call(what) === '[object Error]' || what instanceof Error;
    }

    /**
     * hasKey, a better form of hasOwnProperty
     * Example: hasKey(MainHostObject, property) === true/false
     *
     * @param {Object} host object to check property
     * @param {string} key to check
     */
    function hasKey(object, key) {
        return objectPrototype.hasOwnProperty.call(object, key);
    }

    function each(obj, callback) {
        var i, j;

        if (isUndefined(obj.length)) {
            for (i in obj) {
                if (hasKey(obj, i)) {
                    callback.call(null, i, obj[i]);
                }
            }
        } else {
            j = obj.length;
            if (j) {
                for (i = 0; i < j; i++) {
                    callback.call(null, i, obj[i]);
                }
            }
        }
    }

    function handleStackInfo(stackInfo, options) {
        var frames = [];

        if (stackInfo.stack && stackInfo.stack.length) {
            each(stackInfo.stack, function (i, stack) {
                var frame = normalizeFrame(stack);
                if (frame) {
                    frames.push(frame);
                }
            });
        }

        triggerEvent('handle', {
            stackInfo: stackInfo,
            options: options
        });

        processException(stackInfo.name, stackInfo.message, stackInfo.url, stackInfo.lineno, frames, options);
    }

    function normalizeFrame(frame) {
        if (!frame.url) return;

        // normalize the frames data
        var normalized = {
            filename: frame.url,
            lineno: frame.line,
            colno: frame.column,
            'function': frame.func || '?'
        },
            context = extractContextFromFrame(frame),
            i;

        if (context) {
            var keys = ['pre_context', 'context_line', 'post_context'];
            i = 3;
            while (i--) {
                normalized[keys[i]] = context[i];
            }
        }

        normalized.in_app = !( // determine if an exception came from outside of our app
        // first we check the global includePaths list.
        !!globalOptions.includePaths.test && !globalOptions.includePaths.test(normalized.filename) ||
        // Now we check for fun, if the function name is Raven or TraceKit
        /(Raven|TraceKit)\./.test(normalized['function']) ||
        // finally, we do a last ditch effort and check for raven.min.js
        /raven\.(min\.)?js$/.test(normalized.filename));

        return normalized;
    }

    function extractContextFromFrame(frame) {
        // immediately check if we should even attempt to parse a context
        if (!frame.context || !globalOptions.fetchContext) return;

        var context = frame.context,
            pivot = ~ ~(context.length / 2),
            i = context.length,
            isMinified = false;

        while (i--) {
            // We're making a guess to see if the source is minified or not.
            // To do that, we make the assumption if *any* of the lines passed
            // in are greater than 300 characters long, we bail.
            // Sentry will see that there isn't a context
            if (context[i].length > 300) {
                isMinified = true;
                break;
            }
        }

        if (isMinified) {
            // The source is minified and we don't know which column. Fuck it.
            if (isUndefined(frame.column)) return;

            // If the source is minified and has a frame column
            // we take a chunk of the offending line to hopefully shed some light
            return [[], // no pre_context
            context[pivot].substr(frame.column, 50), // grab 50 characters, starting at the offending column
            [] // no post_context
            ];
        }

        return [context.slice(0, pivot), // pre_context
        context[pivot], // context_line
        context.slice(pivot + 1) // post_context
        ];
    }

    function processException(type, message, fileurl, lineno, frames, options) {
        var stacktrace, i, fullMessage;

        if (!!globalOptions.ignoreErrors.test && globalOptions.ignoreErrors.test(message)) return;

        message += '';
        fullMessage = type + ': ' + message;

        if (frames && frames.length) {
            fileurl = frames[0].filename || fileurl;
            // Sentry expects frames oldest to newest
            // and JS sends them as newest to oldest
            frames.reverse();
            stacktrace = { frames: frames };
        } else if (fileurl) {
            stacktrace = {
                frames: [{
                    filename: fileurl,
                    lineno: lineno,
                    in_app: true
                }]
            };
        }

        if (!!globalOptions.ignoreUrls.test && globalOptions.ignoreUrls.test(fileurl)) return;
        if (!!globalOptions.whitelistUrls.test && !globalOptions.whitelistUrls.test(fileurl)) return;

        // Fire away!
        send(objectMerge({
            // sentry.interfaces.Exception
            exception: {
                values: [{
                    type: type,
                    value: message,
                    stacktrace: stacktrace
                }]
            },
            culprit: fileurl,
            message: fullMessage
        }, options));
    }

    function objectMerge(obj1, obj2) {
        if (!obj2) {
            return obj1;
        }
        each(obj2, function (key, value) {
            obj1[key] = value;
        });
        return obj1;
    }

    function truncate(str, max) {
        return str.length <= max ? str : str.substr(0, max) + '…';
    }

    function trimPacket(data) {
        // For now, we only want to truncate the two different messages
        // but this could/should be expanded to just trim everything
        var max = globalOptions.maxMessageLength;
        data.message = truncate(data.message, max);
        if (data.exception) {
            var exception = data.exception.values[0];
            exception.value = truncate(exception.value, max);
        }

        return data;
    }

    function now() {
        return +new Date();
    }

    function getHttpData() {
        if (!hasDocument || !document.location || !document.location.href) {
            return;
        }

        var httpData = {
            headers: {
                'User-Agent': navigator.userAgent
            }
        };

        httpData.url = document.location.href;

        if (document.referrer) {
            httpData.headers.Referer = document.referrer;
        }

        return httpData;
    }

    function send(data) {
        var baseData = {
            project: globalProject,
            logger: globalOptions.logger,
            platform: 'javascript'
        },
            httpData = getHttpData();

        if (httpData) {
            baseData.request = httpData;
        }

        data = objectMerge(baseData, data);

        // Merge in the tags and extra separately since objectMerge doesn't handle a deep merge
        data.tags = objectMerge(objectMerge({}, globalContext.tags), data.tags);
        data.extra = objectMerge(objectMerge({}, globalContext.extra), data.extra);

        // Send along our own collected metadata with extra
        data.extra['session:duration'] = now() - startTime;

        // If there are no tags/extra, strip the key from the payload alltogther.
        if (isEmptyObject(data.tags)) delete data.tags;

        if (globalContext.user) {
            // sentry.interfaces.User
            data.user = globalContext.user;
        }

        // Include the release if it's defined in globalOptions
        if (globalOptions.release) data.release = globalOptions.release;
        // Include server_name if it's defined in globalOptions
        if (globalOptions.serverName) data.server_name = globalOptions.serverName;

        if (isFunction(globalOptions.dataCallback)) {
            data = globalOptions.dataCallback(data) || data;
        }

        // Why??????????
        if (!data || isEmptyObject(data)) {
            return;
        }

        // Check if the request should be filtered or not
        if (isFunction(globalOptions.shouldSendCallback) && !globalOptions.shouldSendCallback(data)) {
            return;
        }

        // Send along an event_id if not explicitly passed.
        // This event_id can be used to reference the error within Sentry itself.
        // Set lastEventId after we know the error should actually be sent
        _lastEventId = data.event_id || (data.event_id = uuid4());

        // Try and clean up the packet before sending by truncating long values
        data = trimPacket(data);

        logDebug('debug', 'Raven about to send:', data);

        if (!_isSetup()) return;

        (globalOptions.transport || makeRequest)({
            url: globalServer,
            auth: {
                sentry_version: '7',
                sentry_client: 'raven-js/' + Raven.VERSION,
                sentry_key: globalKey
            },
            data: data,
            options: globalOptions,
            onSuccess: function success() {
                triggerEvent('success', {
                    data: data,
                    src: globalServer
                });
            },
            onError: function failure() {
                triggerEvent('failure', {
                    data: data,
                    src: globalServer
                });
            }
        });
    }

    function makeRequest(opts) {
        // Tack on sentry_data to auth options, which get urlencoded
        opts.auth.sentry_data = JSON.stringify(opts.data);

        var img = newImage(),
            src = opts.url + '?' + urlencode(opts.auth),
            crossOrigin = opts.options.crossOrigin;

        if (crossOrigin || crossOrigin === '') {
            img.crossOrigin = crossOrigin;
        }
        img.onload = opts.onSuccess;
        img.onerror = img.onabort = opts.onError;
        img.src = src;
    }

    // Note: this is shitty, but I can't figure out how to get
    // sinon to stub document.createElement without breaking everything
    // so this wrapper is just so I can stub it for tests.
    function newImage() {
        return document.createElement('img');
    }

    var ravenNotConfiguredError;

    function _isSetup() {
        if (!hasJSON) return false; // needs JSON support
        if (!globalServer) {
            if (!ravenNotConfiguredError) logDebug('error', 'Error: Raven has not been configured.');
            ravenNotConfiguredError = true;
            return false;
        }
        return true;
    }

    function joinRegExp(patterns) {
        // Combine an array of regular expressions and strings into one large regexp
        // Be mad.
        var sources = [],
            i = 0,
            len = patterns.length,
            pattern;

        for (; i < len; i++) {
            pattern = patterns[i];
            if (isString(pattern)) {
                // If it's a string, we need to escape it
                // Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                sources.push(pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"));
            } else if (pattern && pattern.source) {
                // If it's a regexp already, we want to extract the source
                sources.push(pattern.source);
            }
            // Intentionally skip other cases
        }
        return new RegExp(sources.join('|'), 'i');
    }

    function uuid4() {
        var crypto = window.crypto || window.msCrypto;

        if (!isUndefined(crypto) && crypto.getRandomValues) {
            // Use window.crypto API if available
            var arr = new Uint16Array(8);
            crypto.getRandomValues(arr);

            // set 4 in byte 7
            arr[3] = arr[3] & 0xFFF | 0x4000;
            // set 2 most significant bits of byte 9 to '10'
            arr[4] = arr[4] & 0x3FFF | 0x8000;

            var pad = function pad(num) {
                var v = num.toString(16);
                while (v.length < 4) {
                    v = '0' + v;
                }
                return v;
            };

            return pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]);
        } else {
            // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
            return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        }
    }

    function logDebug(level) {
        if (originalConsoleMethods[level] && Raven.debug) {
            // _slice is coming from vendor/TraceKit/tracekit.js
            // so it's accessible globally
            originalConsoleMethods[level].apply(originalConsole, _slice.call(arguments, 1));
        }
    }

    function afterLoad() {
        // Attempt to initialize Raven on load
        var RavenConfig = window.RavenConfig;
        if (RavenConfig) {
            Raven.config(RavenConfig.dsn, RavenConfig.config).install();
        }
    }

    function urlencode(o) {
        var pairs = [];
        each(o, function (key, value) {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        return pairs.join('&');
    }

    function mergeContext(key, context) {
        if (isUndefined(context)) {
            delete globalContext[key];
        } else {
            globalContext[key] = objectMerge(globalContext[key] || {}, context);
        }
    }

    afterLoad();

    // This is being exposed no matter what because there are too many weird
    // usecases for how people use Raven. If this is really a problem, I'm sorry.
    window.Raven = Raven;

    // Expose Raven to the world
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('raven', [], function () {
            return Raven;
        });
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
        // browserify
        module.exports = Raven;
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // CommonJS
        exports = Raven;
    }
})(typeof window !== 'undefined' ? window : undefined);

},{}],136:[function(require,module,exports){
"use strict";

/**
 * Superstore synchronous library
 *
 * @author Matt Andrews <matthew.andrews@ft.com>
 * @copyright The Financial Times [All Rights Reserved]
 */

var escapeRegex = function escapeRegex(str) {
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
};

var keys = {};
var store = {};
var persist = true;

// Watch for changes from other tabs

function Superstore(type) {
  this.storage = window[type];
  this.keys = {};
  this.store = {};
  // TODO: check the storageArea so that we only refresh the key when we need to
  window.addEventListener("storage", (function (e) {
    if (this.keys[e.key]) {
      this.keys[e.key] = true;
      this.store[e.key] = JSON.parse(e.newValue);
    }
  }).bind(this));
}

/**
 * get localstorage value for key falling back to in memory for iOS private browsing bug
 * <http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue>
 * @param {String} key
 * @return {*} data for supplied key
 *
 */
Superstore.prototype.get = function (key) {
  if (arguments.length !== 1) {
    throw Error("get expects 1 argument, " + arguments.length + " given; " + key);
  }
  if (!this.keys[key] && persist) {
    var data;
    try {
      data = this.storage[key];
    } catch (e) {
      persist = false; // Safari 8 with Cookies set to 'Never' throws on every read
    }

    // Slightly weird hack because JSON.parse of an undefined value throws
    // a weird exception "SyntaxError: Unexpected token u"
    if (data) data = JSON.parse(data);
    this.store[key] = data;
    this.keys[key] = true;
  }
  return this.store[key];
};

/**
 * set localstorage key,value falling back to in memory for iOS private browsing bug
 * <http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue>
 * @param {String} key
 * @param {*} value which will be passed via JSON.stringify
 * @return {*} value
 *
 */
Superstore.prototype.set = function (key, value) {
  if (arguments.length !== 2) {
    throw Error("set expects 2 arguments, " + arguments.length + " given; " + key);
  }
  if (persist) {
    try {
      this.storage[key] = JSON.stringify(value);
    } catch (err) {

      // Known iOS Private Browsing Bug - fall back to non-persistent storage
      if (err.code === 22) {
        persist = false;
      } else {
        throw err;
      }
    }
  }

  this.store[key] = value;
  this.keys[key] = true;
  return value;
};

/**
 * unset value in store for key
 * @param {String} key
 */
Superstore.prototype.unset = function (key) {
  delete this.store[key];
  delete this.keys[key];
  this.storage.removeItem(key);
};

/**
 * clear localstorage
 * @param clearPrefix will clear keys starting with `clearPrefix`
 * #clear(true) and #clear() clear cache and persistent layer, #clear(false) only clears cache
 *
 */
Superstore.prototype.clear = function (clearPrefix) {
  if (!clearPrefix) {
    if (persist) {
      this.storage.clear();
    }
    this.store = {};
    this.keys = {};
    return;
  }

  clearPrefix = escapeRegex(clearPrefix);
  var clearKeyRegex = new RegExp("^" + clearPrefix);
  for (var key in this.keys) {
    if (key.match(clearKeyRegex)) {
      this.unset(key);
    }
  }
};

module.exports.isPersisting = function () {
  return persist;
};

module.exports.local = new Superstore('localStorage');
module.exports.session = new Superstore('sessionStorage');

},{}],137:[function(require,module,exports){
"use strict";

/**
 * Superstore
 *
 * @author Matt Andrews <matthew.andrews@ft.com>
 * @copyright The Financial Times [All Rights Reserved]
 */
var sync = require("./../../superstore-sync/lib/superstore-sync.js");

var keys = {};
var store = {};

function Superstore(type, namespace) {
  if (!namespace) {
    throw "Namespace required";
  }
  this.store = sync[type];
  this.namespace = "_ss." + namespace + ".";
}

Superstore.prototype.get = function (key) {
  return new Promise((function (resolve) {
    resolve(this.store.get(this.namespace + key));
  }).bind(this));
};

Superstore.prototype.set = function (key, value) {
  return new Promise((function (resolve) {
    resolve(this.store.set(this.namespace + key, value));
  }).bind(this));
};

Superstore.prototype.unset = function (key) {
  return new Promise((function (resolve) {
    resolve(this.store.unset(this.namespace + key));
  }).bind(this));
};

/**
 * #clear(true) and #clear() clear cache and persistent layer, #clear(false) only clears cache
 *
 */
Superstore.prototype.clear = function () {
  return new Promise((function (resolve) {
    resolve(this.store.clear(this.namespace));
  }).bind(this));
};

Superstore.isPersisting = sync.isPersisting;

module.exports = Superstore;

},{"./../../superstore-sync/lib/superstore-sync.js":136}],138:[function(require,module,exports){
/*jshint node:true*/
'use strict';

var JsSetup = require('./src/js-setup');

module.exports = new JsSetup();

},{"./src/js-setup":139}],139:[function(require,module,exports){
/*jshint node:true*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('./stubs').init();
var nThirdPartyCode = require("./../bower_components/n-third-party-code/src/main.js");

function waitForCondition(conditionName, action) {
	window['ftNext' + conditionName + 'Flag'] ? action() : document.addEventListener('ftNext' + conditionName, action);
}

var JsSetup = (function () {
	function JsSetup() {
		_classCallCheck(this, JsSetup);
	}

	_createClass(JsSetup, [{
		key: '_throw',
		value: function _throw(err) {
			setTimeout(function () {
				throw err;
			}, 0);
		}

		// Dispatch a custom `ftNextLoaded` event after the app executes.

	}, {
		key: 'dispatchLoadedEvent',
		value: function dispatchLoadedEvent() {
			var ftNextLoaded = false;
			var ftNextLoadedTrigger = function ftNextLoadedTrigger() {
				if (document.readyState === 'complete' && ftNextLoaded === false) {
					ftNextLoaded = true;
					window.dispatchEvent(new CustomEvent('ftNextLoaded'));
					return true;
				}
			};
			if (!ftNextLoadedTrigger()) {
				window.addEventListener('load', ftNextLoadedTrigger);
				document.onreadystatechange = ftNextLoadedTrigger;
			}
		}
	}, {
		key: 'init',
		value: function init(opts) {
			var _this = this;

			var flagsClient = require("./../bower_components/next-feature-flags-client/client/main.js");

			var nInstrumentation = require("./../bower_components/n-instrumentation/src/main.js");
			var attachFastClick = require("./../bower_components/fastclick/lib/fastclick.js");
			var hoverable = require("./../bower_components/o-hoverable/main.js");
			var oErrors = require("./../bower_components/o-errors/main.js");
			this.appInfo = {
				isProduction: document.documentElement.hasAttribute('data-next-is-production'),
				version: document.documentElement.getAttribute('data-next-version'),
				name: document.documentElement.getAttribute('data-next-app')
			};

			// may be used for app specific config in future
			opts = opts || {};

			attachFastClick(document.body);
			hoverable.init();

			return flagsClient.init().then(function (flags) {

				oErrors.init({
					enabled: flags.get('clientErrorReporting') && _this.appInfo.isProduction,
					sentryEndpoint: 'https://edb56e86be2446eda092e69732d8654b@app.getsentry.com/32594',
					siteVersion: _this.appInfo.version,
					logLevel: flags.get('clientDetailedErrorReporting') ? 'contextonly' : 'off',
					tags: { appName: _this.appInfo.name },
					errorBuffer: window.errorBuffer || []
				});

				if (flags.get('clientAjaxErrorReporting')) {
					(function () {

						var realFetch = window.fetch;

						window.fetch = function (url, opts) {
							return realFetch.call(this, url, opts).catch(function (err) {
								oErrors.log(url + (opts ? JSON.stringify(opts) : '') + err);
								throw err;
							});
						};
					})();
				}

				// FT and next tracking
				nThirdPartyCode.init(flags, oErrors, _this.appInfo);
				if (flags.get('nInstrumentation')) {
					nInstrumentation.init();
				}

				return {
					flags: flags
				};
			});
		}
	}, {
		key: 'runAfterApplicationCode',
		value: function runAfterApplicationCode(flags) {
			document.documentElement.classList.add('js-success');
			// ads and third party tracking
			nThirdPartyCode.initAfterEverythingElse(flags);
			this.dispatchLoadedEvent();
		}
	}, {
		key: 'bootstrap',
		value: function bootstrap(callback, opts) {
			var _this2 = this;

			waitForCondition('DependenciesLoaded', function () {
				_this2.bootstrapResult = _this2.init(opts).then(function (result) {
					var promise = callback(result);
					if (promise && typeof promise.then === 'function') {
						return promise.then(function () {
							return _this2.runAfterApplicationCode(result.flags);
						});
					} else {
						_this2.runAfterApplicationCode(result.flags);
					}
				}).catch(_this2._throw);
			});
		}
	}, {
		key: 'loadScript',
		value: function loadScript(src) {
			return new Promise(function (res, rej) {
				var script = window.ftNextLoadScript(src);
				script.addEventListener('load', res);
				script.addEventListener('error', rej);
			});
		}
	}]);

	return JsSetup;
})();

module.exports = JsSetup;

},{"./../bower_components/fastclick/lib/fastclick.js":1,"./../bower_components/n-instrumentation/src/main.js":53,"./../bower_components/n-third-party-code/src/main.js":66,"./../bower_components/next-feature-flags-client/client/main.js":84,"./../bower_components/o-errors/main.js":111,"./../bower_components/o-hoverable/main.js":115,"./stubs":140}],140:[function(require,module,exports){
'use strict';

module.exports = {

	init: function init() {
		// stub console
		if (!window.console) {
			window.console = {};
			var methods = ['info', 'log', 'warn', 'error'];
			for (var i = 0; i < methods.length; i++) {
				window.console[methods[i]] = function () {};
			}
		}
	}

};

},{}],141:[function(require,module,exports){
'use strict';

function ok(featureName, thing) {
	var result = document.querySelector('[data-feature="' + featureName + '"]');
	result.classList.add('ok');

	if (thing !== false) {
		thing = thing || window[featureName];

		if (/\[native code\]/.test(thing.toString())) {
			result.classList.add('native');
		} else {
			result.classList.add('polyfill');
		}
	}
}

require('../../main').bootstrap(function () {
	ok('app', false);
	try {
		fetch('/').then(function () {
			ok('fetch');
		});
	} catch (e) {}
	try {
		window.requestAnimationFrame(function () {});
		ok('requestAnimationFrame');
	} catch (e) {}
	try {
		new Promise(function () {});
		ok('Promise');
	} catch (e) {}
	try {
		window.matchMedia('screen');
		ok('matchMedia');
	} catch (e) {}
	try {
		[].find(function () {});
		ok('Array.prototype.find', Array.prototype.find);
	} catch (e) {}
	try {
		[].findIndex(function () {});
		ok('Array.prototype.findIndex', Array.prototype.findIndex);
	} catch (e) {}

	try {
		Array.from([]);
		ok('Array.from', Array.from);
	} catch (e) {}
	try {
		Array.isArray([]);
		ok('Array.isArray', Array.isArray);
	} catch (e) {}
	try {
		[].every(function () {});
		ok('Array.prototype.every', Array.prototype.every);
	} catch (e) {}
	try {
		[].filter(function () {});
		ok('Array.prototype.filter', Array.prototype.filter);
	} catch (e) {}
	try {
		[].forEach(function () {});
		ok('Array.prototype.forEach', Array.prototype.forEach);
	} catch (e) {}
	try {
		[].indexOf(1);
		ok('Array.prototype.indexOf', Array.prototype.indexOf);
	} catch (e) {}
	try {
		[].lastIndexOf(1);
		ok('Array.prototype.lastIndexOf', Array.prototype.lastIndexOf);
	} catch (e) {}
	try {
		[].map(function () {});
		ok('Array.prototype.map', Array.prototype.map);
	} catch (e) {}
	try {
		[].reduce(function () {}, {});
		ok('Array.prototype.reduce', Array.prototype.reduce);
	} catch (e) {}
	try {
		[].reduceRight(function () {}, {});
		ok('Array.prototype.reduceRight', Array.prototype.reduceRight);
	} catch (e) {}
	try {
		[].some(function () {});
		ok('Array.prototype.some', Array.prototype.some);
	} catch (e) {}
	try {
		new CustomEvent('testEvent');
		ok('CustomEvent');
	} catch (e) {}
	try {
		Date.now();
		ok('Date.now', Date.now);
	} catch (e) {}
	try {
		new Date().toISOString();
		ok('Date.prototype.toISOString', Date.prototype.toISOString);
	} catch (e) {}
	try {
		document.createElement('div').classList.add('class');
		ok('Element.prototype.classList', document.createElement('div').classList.add);
	} catch (e) {}
	try {
		document.createElement('div').cloneNode();
		ok('Element.prototype.cloneNode', Element.prototype.cloneNode);
	} catch (e) {}
	try {
		document.createElement('div').closest('body');
		ok('Element.prototype.closest', Element.prototype.closest);
	} catch (e) {}
	try {
		document.createElement('div').matches('div');
		ok('Element.prototype.matches', Element.prototype.matches);
	} catch (e) {}
	try {
		JSON.parse('{}');
		ok('JSON', JSON.parse);
	} catch (e) {}
	try {
		Object.assign({}, {});
		ok('Object.assign', Object.assign);
	} catch (e) {}
	try {
		Object.create({});
		ok('Object.create', Object.create);
	} catch (e) {}
	// try {
	// 	!!Object.defineProperties; // todo check the signature
	// 	ok('Object.defineProperties', Object.defineProperties)
	// } catch (e) {}
	// try {
	// 	!!Object.defineProperty; // todo check the signature
	// 	ok('Object.defineProperty', Object.defineProperty)
	// } catch (e) {}
	try {
		Object.getOwnPropertyNames({});
		ok('Object.getOwnPropertyNames', Object.getOwnPropertyNames);
	} catch (e) {}
	try {
		Object.getPrototypeOf({});
		ok('Object.getPrototypeOf', Object.getPrototypeOf);
	} catch (e) {}
	try {
		Object.keys({});
		ok('Object.keys', Object.keys);
	} catch (e) {}
	// try {
	// 	PageVisibility
	// 	ok('PageVisibility')
	// } catch (e) {}
	try {
		''.includes('k');
		ok('String.prototype.includes', String.prototype.includes);
	} catch (e) {}
	try {
		' '.trim();
		ok('String.prototype.trim', String.prototype.trim);
	} catch (e) {}
	try {
		document.querySelector('body');
		document.querySelectorAll('body');
		ok('document.querySelector', document.querySelector);
	} catch (e) {}
	try {
		document.createElement('picture');
		ok('HTMLPictureElement');
	} catch (e) {}
});

},{"../../main":138}]},{},[141]);
/* eslint-enable */
