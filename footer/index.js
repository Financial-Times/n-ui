"use strict";
const expander = require('../expander');
const viewport = require('../viewport');

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

function createExpanders(names){
	let expanders = {};
	names.forEach(name => {
		createExpander(name, expanders);
	});

	return expanders;
}

function onBreakPointChange(expanders, e){
	let breakpoint = e.detail.size;
	let func = (breakpoint === 'default' || breakpoint === 'S') ? createExpander : destroyExpander;
	func('tools', expanders);
	func('services', expanders);
}

function init(flags){
	if(!flags.get('newFooter')){
		return;
	}

	const expanders = createExpanders(['ft-group']);
	document.body.addEventListener('viewport.breakpoint', onBreakPointChange.bind(null, expanders));
	viewport.listenForBreakpointChanges();
}

module.exports = { init };
