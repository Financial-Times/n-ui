const oGrid = require('o-grid');
const viewport = require('../viewport');
const utils = require('../utils');

let listening = false;

function getCurrentBreakpoint(){
	return oGrid.getCurrentLayout();
}

function fireBreakpointEvent(breakpoint){
	utils.broadcast('grid.layoutChange', {layout:breakpoint});
}

function listenForBreakpointChanges(){
	if(listening){
		return;
	}

	let lastBreakpoint = getCurrentBreakpoint();
	fireBreakpointEvent(lastBreakpoint);
	viewport.listenTo('resize');
	document.body.addEventListener('oViewport.resize', () => {
		let breakpoint = getCurrentBreakpoint();
		console.log('viewport.resize', breakpoint);
		if(breakpoint !== lastBreakpoint){
			fireBreakpointEvent(breakpoint);
			lastBreakpoint = breakpoint;
		}
	});
	listening = true;
}

module.exports = oGrid;
module.exports.listenForBreakpointChanges = listenForBreakpointChanges;
