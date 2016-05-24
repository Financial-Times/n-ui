'use strict';

function ok (featureName, thing) {
	const result = document.querySelector(`[data-feature="${featureName}"]`);
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
		fetch('/')
			.then(() => {
				ok('fetch');
			})
	} catch (e) {}
	try {
		window.requestAnimationFrame(function () {});
		ok('requestAnimationFrame');
	} catch (e) { }
	try {
		new Promise(function () {})
		ok('Promise');
	} catch (e) {}
	try {
		window.matchMedia('screen')
		ok('matchMedia');
	} catch (e) {}
	try {
		[].find(function () {});
		ok('Array.prototype.find', Array.prototype.find)
	} catch (e) {}
	try {
		[].findIndex(function () {});
		ok('Array.prototype.findIndex', Array.prototype.findIndex)
	} catch (e) {}

	try {
		Array.from([])
		ok('Array.from', Array.from)
	} catch (e) {}
	try {
		Array.isArray([])
		ok('Array.isArray', Array.isArray)
	} catch (e) {}
	try {
		[].every(function () {});
		ok('Array.prototype.every', Array.prototype.every)
	} catch (e) {}
	try {
		[].filter(function () {});
		ok('Array.prototype.filter', Array.prototype.filter)
	} catch (e) {}
	try {
		[].forEach(function () {});
		ok('Array.prototype.forEach', Array.prototype.forEach)
	} catch (e) {}
	try {
		[].indexOf(1);
		ok('Array.prototype.indexOf', Array.prototype.indexOf)
	} catch (e) {}
	try {
		[].lastIndexOf(1);
		ok('Array.prototype.lastIndexOf', Array.prototype.lastIndexOf)
	} catch (e) {}
	try {
		[].map(function () {});
		ok('Array.prototype.map', Array.prototype.map)
	} catch (e) {}
	try {
		[].reduce(function () {}, {});
		ok('Array.prototype.reduce', Array.prototype.reduce)
	} catch (e) {}
	try {
		[].reduceRight(function () {}, {});
		ok('Array.prototype.reduceRight', Array.prototype.reduceRight)
	} catch (e) {}
	try {
		[].some(function () {});
		ok('Array.prototype.some', Array.prototype.some)
	} catch (e) {}
	try {
		new CustomEvent('testEvent');
		ok('CustomEvent')
	} catch (e) {}
	try {
		Date.now()
		ok('Date.now', Date.now);
	} catch (e) {}
	try {
		new Date().toISOString();
		ok('Date.prototype.toISOString', Date.prototype.toISOString)
	} catch (e) {}
	try {
		document.createElement('div').classList.add('class')
		ok('Element.prototype.classList', document.createElement('div').classList.add)
	} catch (e) {}
	try {
		document.createElement('div').cloneNode()
		ok('Element.prototype.cloneNode', Element.prototype.cloneNode)
	} catch (e) {}
	try {
		document.createElement('div').closest('body')
		ok('Element.prototype.closest', Element.prototype.closest)
	} catch (e) {}
	try {
		document.createElement('div').matches('div')
		ok('Element.prototype.matches', Element.prototype.matches)
	} catch (e) {}
	try {
		JSON.parse('{}')
		ok('JSON', JSON.parse)
	} catch (e) {}
	try {
		Object.assign({}, {})
		ok('Object.assign', Object.assign)
	} catch (e) {}
	try {
		Object.create({})
		ok('Object.create', Object.create)
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
		ok('Object.getOwnPropertyNames', Object.getOwnPropertyNames)
	} catch (e) {}
	try {
		Object.getPrototypeOf({});
		ok('Object.getPrototypeOf', Object.getPrototypeOf)
	} catch (e) {}
	try {
		Object.keys({});
		ok('Object.keys', Object.keys)
	} catch (e) {}
	// try {
	// 	PageVisibility
	// 	ok('PageVisibility')
	// } catch (e) {}
	try {
		''.includes('k')
		ok('String.prototype.includes', String.prototype.includes)
	} catch (e) {}
	try {
		' '.trim()
		ok('String.prototype.trim', String.prototype.trim)
	} catch (e) {}
	try {
		document.querySelector('body');
		document.querySelectorAll('body');
		ok('document.querySelector', document.querySelector)
	} catch (e) {}
	try {
		document.createElement('picture');
		ok('HTMLPictureElement');
	} catch (e) {}
});


