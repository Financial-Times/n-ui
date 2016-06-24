const oViewport = require('o-viewport');
const utils = require('../utils');

const GRID_BREAKPOINTS = new Map([
	['default', [0,489]],
	['S', [490,739]],
	['M', [740,979]],
	['L', [980,1219]],
	['XL', [1220,Infinity]]
]);

let listening = false;

function getCurrentBreakpoint(){
	let width = oViewport.getSize().width;
	for(let entry of GRID_BREAKPOINTS.entries()){
		if(width > entry[1][0] && width < entry[1][1]){
			return entry[0];
		}
	}
}

function fireBreakpointEvent(breakpoint){
	utils.broadcast('viewport.breakpoint', {size:breakpoint});
}

function listenForBreakpointChanges(){
	if(listening){
		return;
	}
	let lastBreakpoint = getCurrentBreakpoint();
	fireBreakpointEvent(lastBreakpoint);
	oViewport.listenTo('resize');
	document.body.addEventListener('oViewport.resize', () => {
		let breakpoint = getCurrentBreakpoint();
		if(breakpoint !== lastBreakpoint){
			fireBreakpointEvent(breakpoint);
			lastBreakpoint = breakpoint;
		}
	});
	listening = true;
}

module.exports = oViewport;
module.exports.listenForBreakpointChanges = listenForBreakpointChanges;
