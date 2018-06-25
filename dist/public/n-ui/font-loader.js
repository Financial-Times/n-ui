/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 129);
/******/ })
/************************************************************************/
/******/ ({

/***/ 113:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),

/***/ 129:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _oTypography = __webpack_require__(130);

var _oTypography2 = _interopRequireDefault(_oTypography);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var perfMark = __webpack_require__(24);

new _oTypography2.default(document.documentElement).loadFonts().then(function () {
	return perfMark('fontsLoaded');
});

/***/ }),

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typography = __webpack_require__(131);

var _typography2 = _interopRequireDefault(_typography);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var constructAll = function constructAll() {
	_typography2.default.init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};

document.addEventListener('o.DOMContentLoaded', constructAll);

exports.default = _typography2.default;
module.exports = exports['default'];

/***/ }),

/***/ 131:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FontFaceObserver = __webpack_require__(132);

var Typography = function () {
	function Typography(typographyEl, opts) {
		_classCallCheck(this, Typography);

		this.typographyEl = typographyEl;

		this.opts = opts || Typography.getOptions(typographyEl);
		if (typeof this.opts.loadOnInit === 'undefined') {
			this.opts.loadOnInit = true;
		}
		if (typeof this.opts.rejectOnFontLoadFailure === 'undefined') {
			this.opts.rejectOnFontLoadFailure = false;
		}
		this.opts = Typography.checkOptions(this.opts);
		this.hasRun = false;

		this.fontConfigs = [{
			family: 'FinancierDisplayWeb',
			weight: 'normal',
			label: 'display'
		}, {
			family: 'MetricWeb',
			weight: 'normal',
			label: 'sans'
		}, {
			family: 'MetricWeb',
			weight: 600,
			label: 'sansBold'
		}, {
			family: 'FinancierDisplayWeb',
			weight: 700,
			label: 'displayBold'
		}];
		if (this.opts.loadOnInit) {
			this.loadFonts();
		}
	}

	/**
  * Get the data attributes from the typographyEl. If typography is being set up
  * declaratively, this method is used to extract the data attributes from
  * the DOM.
  * @param {HTMLElement} typographyEl - The typography element in the DOM (Required)
  */


	_createClass(Typography, [{
		key: 'checkFontsLoaded',
		value: function checkFontsLoaded() {
			return new RegExp('(^|s)' + this.opts.fontLoadedCookieName + '=1(;|$)').test(document.cookie);
		}
	}, {
		key: 'setCookie',
		value: function setCookie() {
			var domain = /.ft.com$/.test(location.hostname) ? '.ft.com' : location.hostname;
			// set cookie for a week
			// TODO - use RUM to work out what a good value for this would actually be
			document.cookie = this.opts.fontLoadedCookieName + '=1;domain=' + domain + ';path=/;max-age=' + 60 * 60 * 24 * 7;
		}
	}, {
		key: 'removeLoadingClasses',
		value: function removeLoadingClasses() {
			var _this = this;

			this.fontConfigs.forEach(function (config) {
				_this.typographyEl.classList.remove('' + _this.opts.fontLoadingPrefix + config.label);
			});
		}
	}, {
		key: 'loadFonts',
		value: function loadFonts() {
			var _this2 = this;

			if (this.hasRun) {
				return Promise.resolve();
			}
			if (this.checkFontsLoaded()) {
				this.removeLoadingClasses();
				this.setCookie();
				this.hasRun = true;
				return Promise.resolve();
			}

			var fontPromises = this.fontConfigs.map(function (fontConfig) {
				return new FontFaceObserver(fontConfig.family, { weight: fontConfig.weight }).load().then(function () {
					_this2.typographyEl.classList.remove('' + _this2.opts.fontLoadingPrefix + fontConfig.label);
				});
			});

			return Promise.all(fontPromises).then(function () {
				// set value in cookie for subsequent visits
				_this2.setCookie();
				_this2.hasRun = true;
			}).catch(function (error) {
				if (_this2.opts.rejectOnFontLoadFailure) {
					throw error;
				}
			});
		}
	}], [{
		key: 'getOptions',
		value: function getOptions(typographyEl) {
			var dataset = Object(typographyEl.dataset);
			return Object.keys(dataset).reduce(function (col, key) {
				// Phantom doesn't like Object.entries :sob:
				if (key === 'oComponent') {
					return col; // Bail on data-o-component
				}
				var shortKey = key.replace(/^oTypography(\w)(\w+)$/, function (m, m1, m2) {
					return m1.toLowerCase() + m2;
				});

				try {
					col[shortKey] = JSON.parse(dataset[key].replace(/\'/g, '"'));
				} catch (e) {
					col[shortKey] = dataset[key];
				}

				return col;
			}, {});
		}

		/**
   * Check the options passed in are valid, otherwise set defaults
   * @param {Object} opts - An Object with configuration options for typography
   * @return {Object} opts
   */

	}, {
		key: 'checkOptions',
		value: function checkOptions(opts) {

			if (!opts.fontLoadingPrefix) {
				opts.fontLoadingPrefix = 'o-typography--loading-';
			}

			if (!opts.fontLoadedCookieName) {
				// backwards compatibility with old local storage implementation
				opts.fontLoadedCookieName = opts.fontLoadedStorageName || 'o-typography-fonts-loaded';
			}

			return opts;
		}
	}, {
		key: 'init',
		value: function init(rootEl, opts) {
			if (!rootEl) {
				rootEl = document.documentElement;
			}
			if (!(rootEl instanceof HTMLElement)) {
				rootEl = document.querySelector(rootEl);
			}
			if (rootEl instanceof HTMLElement && rootEl.matches('[data-o-component=o-typography]')) {
				return new Typography(rootEl, opts);
			}
		}
	}]);

	return Typography;
}();

exports.default = Typography;
module.exports = exports['default'];

/***/ }),

/***/ 132:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* Font Face Observer v2.0.13 - © Bram Stein. License: BSD-3-Clause */(function () {
  function l(a, b) {
    document.addEventListener ? a.addEventListener("scroll", b, !1) : a.attachEvent("scroll", b);
  }function m(a) {
    document.body ? a() : document.addEventListener ? document.addEventListener("DOMContentLoaded", function c() {
      document.removeEventListener("DOMContentLoaded", c);a();
    }) : document.attachEvent("onreadystatechange", function k() {
      if ("interactive" == document.readyState || "complete" == document.readyState) document.detachEvent("onreadystatechange", k), a();
    });
  };function r(a) {
    this.a = document.createElement("div");this.a.setAttribute("aria-hidden", "true");this.a.appendChild(document.createTextNode(a));this.b = document.createElement("span");this.c = document.createElement("span");this.h = document.createElement("span");this.f = document.createElement("span");this.g = -1;this.b.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
    this.f.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText = "display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c);
  }
  function t(a, b) {
    a.a.style.cssText = "max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:" + b + ";";
  }function y(a) {
    var b = a.a.offsetWidth,
        c = b + 100;a.f.style.width = c + "px";a.c.scrollLeft = c;a.b.scrollLeft = a.b.scrollWidth + 100;return a.g !== b ? (a.g = b, !0) : !1;
  }function z(a, b) {
    function c() {
      var a = k;y(a) && a.a.parentNode && b(a.g);
    }var k = a;l(a.b, c);l(a.c, c);y(a);
  };function A(a, b) {
    var c = b || {};this.family = a;this.style = c.style || "normal";this.weight = c.weight || "normal";this.stretch = c.stretch || "normal";
  }var B = null,
      C = null,
      E = null,
      F = null;function G() {
    if (null === C) if (J() && /Apple/.test(window.navigator.vendor)) {
      var a = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);C = !!a && 603 > parseInt(a[1], 10);
    } else C = !1;return C;
  }function J() {
    null === F && (F = !!document.fonts);return F;
  }
  function K() {
    if (null === E) {
      var a = document.createElement("div");try {
        a.style.font = "condensed 100px sans-serif";
      } catch (b) {}E = "" !== a.style.font;
    }return E;
  }function L(a, b) {
    return [a.style, a.weight, K() ? a.stretch : "", "100px", b].join(" ");
  }
  A.prototype.load = function (a, b) {
    var c = this,
        k = a || "BESbswy",
        q = 0,
        D = b || 3E3,
        H = new Date().getTime();return new Promise(function (a, b) {
      if (J() && !G()) {
        var M = new Promise(function (a, b) {
          function e() {
            new Date().getTime() - H >= D ? b() : document.fonts.load(L(c, '"' + c.family + '"'), k).then(function (c) {
              1 <= c.length ? a() : setTimeout(e, 25);
            }, function () {
              b();
            });
          }e();
        }),
            N = new Promise(function (a, c) {
          q = setTimeout(c, D);
        });Promise.race([N, M]).then(function () {
          clearTimeout(q);a(c);
        }, function () {
          b(c);
        });
      } else m(function () {
        function u() {
          var b;if (b = -1 != f && -1 != g || -1 != f && -1 != h || -1 != g && -1 != h) (b = f != g && f != h && g != h) || (null === B && (b = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent), B = !!b && (536 > parseInt(b[1], 10) || 536 === parseInt(b[1], 10) && 11 >= parseInt(b[2], 10))), b = B && (f == v && g == v && h == v || f == w && g == w && h == w || f == x && g == x && h == x)), b = !b;b && (d.parentNode && d.parentNode.removeChild(d), clearTimeout(q), a(c));
        }function I() {
          if (new Date().getTime() - H >= D) d.parentNode && d.parentNode.removeChild(d), b(c);else {
            var a = document.hidden;if (!0 === a || void 0 === a) f = e.a.offsetWidth, g = n.a.offsetWidth, h = p.a.offsetWidth, u();q = setTimeout(I, 50);
          }
        }var e = new r(k),
            n = new r(k),
            p = new r(k),
            f = -1,
            g = -1,
            h = -1,
            v = -1,
            w = -1,
            x = -1,
            d = document.createElement("div");d.dir = "ltr";t(e, L(c, "sans-serif"));t(n, L(c, "serif"));t(p, L(c, "monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);v = e.a.offsetWidth;w = n.a.offsetWidth;x = p.a.offsetWidth;I();z(e, function (a) {
          f = a;u();
        });t(e, L(c, '"' + c.family + '",sans-serif'));z(n, function (a) {
          g = a;u();
        });t(n, L(c, '"' + c.family + '",serif'));
        z(p, function (a) {
          h = a;u();
        });t(p, L(c, '"' + c.family + '",monospace'));
      });
    });
  };"object" === ( false ? undefined : _typeof(module)) ? module.exports = A : (window.FontFaceObserver = A, window.FontFaceObserver.prototype.load = A.prototype.load);
})();
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(113)(module)))

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (name) {
	var performance = window.LUX || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	if (performance && performance.mark) {
		performance.mark(name);
	}
};

/***/ })

/******/ });
//# sourceMappingURL=font-loader.js.map