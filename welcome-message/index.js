const superstore = require('superstore-sync');

function addClass (element, className) {
	element.classList.add(className);
}

function removeClass (element, className) {
	element.classList.remove(className);
}

function store (key, value) {
	superstore.local.set(key, value);
}

function retrieve (key) {
	return superstore.local.get(key);
}

function onButtonClose (func, storageKey, event) {
	event.preventDefault();
	store(storageKey, 1);
	func();
}

function fixBarSetup (floatingElement, footerElement, visibleClass) {
	return () => {
		addClass(floatingElement, visibleClass);
	};
}

function unfixBarSetup (floatingElement, footerElement, visibleClass, hiddenClass) {
	return () => {
		removeClass(floatingElement, visibleClass);
		removeClass(footerElement, hiddenClass);
	};
}

// test whether we can store in local storage
const canStore = () => {
	const testKey = 'next-welcome:test-storage';
	const testValue = 'can-store';
	superstore.local.set(testKey, testValue);
	const retrievedValue = superstore.local.get(testKey);
	superstore.local.unset(testKey);
	return (testValue === retrievedValue) && superstore.isPersisting();
};

module.exports.init = () => {
	let floatingElement = document.querySelector('.n-welcome--fixed');
	let footerElement = document.querySelector('.n-welcome');
	let storageKey = 'welcomePanelClosed';
	let barPreviouslyHidden = Boolean(retrieve(storageKey));
	let visibleClass = 'n-welcome--fixed-visible';
	let hiddenClass = 'n-welcome--js-hidden';
	let fixBar = fixBarSetup(floatingElement, footerElement, visibleClass);
	let unfixBar = unfixBarSetup(floatingElement, footerElement, visibleClass, hiddenClass);

	// Don't display the welcome bar if already acknowledged, or if we can't store in storage
	if (!floatingElement || barPreviouslyHidden || !canStore()) {
		return;
	}

	// otherwise fix the bar
	let closeButton = document.querySelector('.n-welcome__close');
	fixBar();
	// so the bar only appears once
	store(storageKey, 1);
	closeButton.addEventListener('click', onButtonClose.bind(null, unfixBar, storageKey));
};
