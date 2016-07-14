const oGrid = require('o-grid');
const viewport = require('../viewport');
const utils = require('../utils');

let listening = false;

function fireBreakpointEvent(breakpoint){
	utils.broadcast('grid.layoutChange', {layout:breakpoint});
}

function listenForBreakpointChanges(){
	if(listening){
		return;
	}

	let lastBreakpoint = oGrid.getCurrentLayout();
	fireBreakpointEvent(lastBreakpoint);
	viewport.listenTo('resize');
	document.body.addEventListener('oViewport.resize', () => {
		let breakpoint = oGrid.getCurrentLayout();
		if(breakpoint !== lastBreakpoint){
			fireBreakpointEvent(breakpoint);
			lastBreakpoint = breakpoint;
		}
	});
	listening = true;
}

module.exports = oGrid;
module.exports.listenForBreakpointChanges = listenForBreakpointChanges;
module.exports.__wrapsOrigami = true;
