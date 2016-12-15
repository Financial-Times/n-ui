const superstore = require('superstore-sync');
const expander = require('o-expander');
const oViewport = require('o-viewport');

const HAS_MINIMIZED_DEFAULT = 'n-welcome-message-collapsed';
const HAS_MINIMIZED_COMPACT = 'n-welcome-message-compact-ad-collapsed';
const HAS_TAKEN_TOUR = 'n-taken-tour';
const TEST_KEY = 'n-welcome-message-test';
const TEST_VAL = 'can-store';

let fixedEl;
let fixedElHeight;
let staticEl;
let viewportHeight;
let bannerType;

function getBannerType (){
	if(!bannerType){
		let bannerEl = document.querySelector('.n-welcome-banner__column');
		let typeAttr = bannerEl ? bannerEl.getAttribute('data-welcome-banner-type') : 'default';
		bannerType = typeAttr ? typeAttr : 'default';
	}

	return bannerType;
}

function hasLocalStorage () {
	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function localStorageProp (){
	return getBannerType() === 'compact-ad' ? HAS_MINIMIZED_COMPACT : HAS_MINIMIZED_DEFAULT;
}

function userHasMinimized () {
	return superstore.local.get(localStorageProp());
}

function userHasTakenTour () {
	// if we're showing the compact-ad banner we don't care if they have taken the tour
	return getBannerType() === 'compact-ad' ? false : Boolean(superstore.local.get(HAS_TAKEN_TOUR));
}

function setCloseable () {
	const closeButton = fixedEl.querySelector('[data-action="welcome-banner-close"]');
	closeButton.addEventListener('click', () => {
		fixedEl.classList.add('n-welcome-banner--closed');
		superstore.local.set(localStorageProp(), 1);
	});
}

function setExpander () {
	const buttonClass = 'n-welcome-banner__button--toggler';
	const expandableContent = fixedEl.querySelector('.o-expander__content');

	if (userHasMinimized()) {
		expandableContent.setAttribute('aria-hidden', true);
		expandableContent.classList.remove('o-expander__content--expanded');
		toggleContainerDisplay(false);
	}
	expander.init(fixedEl, {
		toggleSelector: `.${buttonClass}`
	});
	fixedEl.addEventListener('oExpander.expand', () => {
		toggleContainerDisplay(true);
		superstore.local.set(localStorageProp(), 0);
		toggleSticky();
	});
	fixedEl.addEventListener('oExpander.collapse', () => {
		toggleContainerDisplay(false);
		superstore.local.set(localStorageProp(), 1);
		toggleSticky();
	});
}

// in addition to what o-expander gives us, add a class onto the container when changing expanded state
function toggleContainerDisplay (showFull) {
	if (showFull) {
		fixedEl.classList.remove('n-welcome-banner--collapsed');
	} else {
		fixedEl.classList.add('n-welcome-banner--collapsed');
	}
}

function updateViewportHeight () {
	viewportHeight = oViewport.getSize().height;
}

// when the static banner top scrolls into view, show that and hide the fixed one
// when the static banner top scrolls out of view, show the fixed one
function toggleSticky () {
	const staticElDistanceFromTop = staticEl.getBoundingClientRect().top;
	const changePoint = (userHasMinimized()) ? viewportHeight : viewportHeight - fixedElHeight;
	if (staticElDistanceFromTop <= changePoint) {
		fixedEl.setAttribute('hidden', true);
	} else {
		fixedEl.removeAttribute('hidden');
	}
}

function setScrollLimitSticky () {
	oViewport.listenTo('resize');
	oViewport.listenTo('orientation');
	oViewport.listenTo('scroll');
	document.body.addEventListener('oViewport.orientation', () => {
		updateViewportHeight();
		toggleSticky();
	});
	document.body.addEventListener('oViewport.resize', () => {
		updateViewportHeight();
		toggleSticky();
	});
	document.body.addEventListener('oViewport.scroll', () => toggleSticky());

	toggleSticky();
}


function setTourButton () {
	const tourButton = fixedEl.querySelector('[data-component="cta-take-tour"]');
	if (tourButton) {
		tourButton.addEventListener('click', () => {
			superstore.local.set(HAS_TAKEN_TOUR, 1);
		});
	}
}

function initSticky () {
	const prop = localStorageProp();
	if (prop === HAS_MINIMIZED_COMPACT && Boolean(superstore.local.get(prop)) === false && hasLocalStorage()) {
		const closeButton = fixedEl.querySelector('button');
		const primaryCTA = fixedEl.querySelector('.n-welcome-banner__button--primary');
		closeButton.onclick = hideSticky;
		primaryCTA.onclick = hideSticky;
		fixedEl.hidden = false;
		staticEl.hidden = true;
	}else{
		hideSticky();
	}
}

function hideSticky (){
	fixedEl.hidden = true;
	staticEl.hidden = false;
	superstore.local.set(localStorageProp(), 1);
}

function init () {
	fixedEl = document.querySelector('.n-welcome-message--fixed');
	staticEl = document.querySelector('.n-welcome-message--static');

	if (!fixedEl) {
		return;
	}
	else if (fixedEl.getAttribute('data-component') === 'welcome-banner') { // new shrinkable banner
		const closeable = document.querySelector('[data-action="welcome-banner-close"]');
		let showFixed = !userHasTakenTour();
		if (closeable) {
			showFixed = showFixed && !userHasMinimized();
		}
		if (showFixed) {
			setTourButton();
			fixedEl.removeAttribute('hidden');
			fixedElHeight = fixedEl.getBoundingClientRect().height;
			updateViewportHeight();
			setScrollLimitSticky();
			if (closeable) {
				setCloseable();
			} else {
				setExpander();
			}
		}
	} else { // old removable message
		initSticky();
	}
};

module.exports = { init };
