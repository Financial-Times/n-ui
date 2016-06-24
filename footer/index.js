"use strict";
const expander = require('../expander');
const grid = require('../grid');

const expanderOpts = {
	toggleSelector:'.o-expander__toggle',
	toggleState: 'aria'
};

function createExpander(name, expanders){
	let selector = `.js-expander-${name}`;
	let el = document.querySelector(selector);
	el.classList.add('o-expander--active');
	expanders[name] = expander.init(el, expanderOpts);
}

function destroyExpander(name, expanders){
	let selector = `.js-expander-${name}`;
	let el = document.querySelector(selector);
	el.classList.remove('o-expander--active');
	if(expanders[name]){
		expanders[name].destroy();
		delete expanders[name];
	}
}

function onLayoutChange(expanders, e){
	let layout = e.detail.layout;
	let func = (layout === 'default' || layout === 'S') ? createExpander : destroyExpander;
	func('tools', expanders);
	func('services', expanders);
}

function init(flags){
	if(!flags.get('newFooter')){
		return;
	}

	const expanders = {};
	createExpander('ft-group', expanders);
	document.body.addEventListener('grid.layoutChange', onLayoutChange.bind(null, expanders));
	grid.listenForBreakpointChanges();
}

module.exports = { init };
