const superstore = require('superstore-sync');

const IOS_DEVICE_REGEX = /OS [0-9]{1,2}(_[0-9]){1,2} like Mac OS X/i;
const ANDROID_DEVICE_REGEX = /Android/i;

function isWebAppCapableDevice(userAgent){
	console.log(isWebAppCapableDevice.name, userAgent);
	return IOS_DEVICE_REGEX.test(userAgent);
}

function isAndroidDevice(userAgent){
	return ANDROID_DEVICE_REGEX.test(userAgent);
}

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

function fixBarSetup (floatingElement, footerElement, visibleClass, hiddenClass) {
	return () => {
		addClass(floatingElement, visibleClass);
		addClass(footerElement, hiddenClass);
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

function showWebAppLink(){
	Array.from(document.querySelectorAll('.js-webapp-link')).forEach(link => {
		let a = link.querySelector('a');
		a.pathname = location.pathname;
		a.search = location.search;
		addClass(link, 'visible');
		hideOptOutLink();
	});
}

function showAndroidLink(){
	Array.from(document.querySelectorAll('.js-android-link')).forEach(link => {
		let a = link.querySelector('a');
		let locationParam = 'location=' + encodeURIComponent(location.pathname + location.search);
		if(a.search){
			a.search += '&' + locationParam;
		}else{
			a.search = '?' + locationParam;
		}
		addClass(link, 'visible');
		hideOptOutLink();
	});
}

function hideOptOutLink(){
	Array.from(document.querySelectorAll('.js-optout-link')).forEach(link => {
		addClass(link, 'hidden');
	});
}

module.exports.init = () => {
	let floatingElement = document.querySelector('.n-welcome--fixed');
	let footerElement = document.querySelector('.n-welcome');
	let storageKey = 'welcomePanelClosed';
	let barPreviouslyHidden = Boolean(retrieve(storageKey));
	let visibleClass = 'n-welcome--fixed-visible';
	let hiddenClass = 'n-welcome--hidden';
	let fixBar = fixBarSetup(floatingElement, footerElement, visibleClass, hiddenClass);
	let unfixBar = unfixBarSetup(floatingElement, footerElement, visibleClass, hiddenClass);

	if(isWebAppCapableDevice(navigator.userAgent)){
		showWebAppLink();
		hideOptOutLink();
	}else if(isAndroidDevice(navigator.userAgent)){
		showAndroidLink();
		hideOptOutLink();
	}

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
