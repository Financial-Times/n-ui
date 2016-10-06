const superstore = require('superstore-sync');
const expander = require('o-expander');
const oViewport = require('o-viewport');

const STORAGE_KEY = 'n-welcome-message-seen';
const HAS_MINIMIZED = 'n-welcome-message-collapsed';
const HAS_TAKEN_TOUR = 'n-taken-tour';
const TEST_KEY = 'n-welcome-message-test';
const TEST_VAL = 'can-store';

let fixedEl;
let fixedElHeight;
let staticEl;
let viewportHeight;

function hasLocalStorage () {
	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function userHasMinimized () {
	return Boolean(superstore.local.get(HAS_MINIMIZED));
}

function userHasTakenTour () {
	return Boolean(superstore.local.get(HAS_TAKEN_TOUR));
}

function setCloseable () {
	const closeButton = fixedEl.querySelector('[data-action="welcome-banner-close"]');
	closeButton.addEventListener('click', () => {
		fixedEl.classList.add('n-welcome-banner--closed');
		superstore.local.set(HAS_MINIMIZED, 1);
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
		superstore.local.set(HAS_MINIMIZED, 0);
		toggleSticky();
	});
	fixedEl.addEventListener('oExpander.collapse', () => {
		toggleContainerDisplay(false);
		superstore.local.set(HAS_MINIMIZED, 1);
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

// this is only required if a welcome message has a 'return to old FT' button in it
function hideIfSegmentId () {
	const segmentId = String(window.location.search).match(/[?&]segmentId=([^?&])/);
	if (segmentId) {
		if (hasLocalStorage()) {
			superstore.local.set(STORAGE_KEY, 1);
		}
		fixedEl.hidden = true;
		staticEl.hidden = true;
	}
}

function setTourButton () {
	const tourButton = fixedEl.querySelector('[data-component="cta-take-tour"]');
	if (tourButton) {
		tourButton.addEventListener('click', () => {
			superstore.local.set(HAS_TAKEN_TOUR, 1);
		});
	}
}

// this is the 'old' welcome functionality, where you only saw the sticky welcome once
// we might go back to this once users are confident with new site
function initOneTimeSticky () {
	hideIfSegmentId();
	if (Boolean(superstore.local.get(STORAGE_KEY)) === false && hasLocalStorage()) {
		const closeButton = fixedEl.querySelector('button');
		closeButton.onclick = function () {
			fixedEl.hidden = true;
		}
		fixedEl.hidden = false;
		staticEl.hidden = true;
	}
	superstore.local.set(STORAGE_KEY, 1);
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
		initOneTimeSticky();
	}
};

module.exports = { init };
