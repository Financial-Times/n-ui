"use strict";
const oExpander = require('o-expander');
const oViewport = require('o-viewport');

const expanderOpts = {
	toggleSelector:'.o-expander__toggle',
	toggleState: 'aria'
};


function createExpander(selector){
	return oExpander.init(document.querySelector(selector), expanderOpts);
}

function createExpanders(names){
	let expanders = {};
	names.forEach(name => {
		expanders[name] = createExpander(`.js-expander-${name}`);
	})

	return expanders;
}

function init(flags){
	if(!flags.get('newFooter')){
		return;
	}

	const expanders = createExpanders(['services', 'tools', 'ft-group']);
}

module.exports = { init };
