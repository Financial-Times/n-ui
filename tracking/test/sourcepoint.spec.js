'use strict';
/*global require,describe,it,expect*/

const flags = { get: function () { return false; }};

const sinon = require('sinon');
const n3rdParty = require('../index');
let sandbox;

let sourcepointScript;

const checkSourcepointScriptLoaded = function() {
	return [].slice.call(document.getElementsByTagName('script'))
		.some(function (s) {
			if(s.src === 'https://h2.ft.com/static-files/sp/prod/long/sp/sp-2.js' && s.getAttribute('data-client-id') === 'pHQAcgfacNTVtzm') {
				sourcepointScript = s;
				return true;
			} else {
				return false;
			}
		});
}

describe('n-third-party-code', function() {

	before(function() {
		n3rdParty.initAfterEverythingElse(flags);
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
		document.cookie = 'spoor-id=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		if(sourcepointScript){
			sourcepointScript.remove();
		}
		document.removeEventListener('sp.blocking', () => {});
  });

	it('should not insert the Sourcepoint script to the page when flag is off', function() {
		sandbox.stub(flags, 'get').withArgs('sourcepoint').returns(false);
		window.dispatchEvent(new Event('ftNextLoaded'));
		let sourcepointLoaded = checkSourcepointScriptLoaded();
		expect(sourcepointLoaded).to.equal(false);
	});

	it('should not insert the Sourcepoint script to the page when there is no spoor-id set', function() {
		sandbox.stub(flags, 'get').withArgs('sourcepoint').returns(true);
		window.dispatchEvent(new Event('ftNextLoaded'));
		let sourcepointLoaded = checkSourcepointScriptLoaded();
		expect(sourcepointLoaded).to.equal(false);
	});

	it('should not insert the Sourcepoint script to the page when there spoor-id does not start with 0', function() {
		document.cookie = 'spoor-id=1234567890;';
		sandbox.stub(flags, 'get').withArgs('sourcepoint').returns(true);
		window.dispatchEvent(new Event('ftNextLoaded'));
		let sourcepointLoaded = checkSourcepointScriptLoaded();
		expect(sourcepointLoaded).to.equal(false);
	});

	it('should send an oTracking event when sourcepoint event has been fired', function(done) {
		document.cookie = 'spoor-id=0123456789;';
		sandbox.stub(flags, 'get').withArgs('sourcepoint').returns(true);
		window.dispatchEvent(new Event('ftNextLoaded'));
		document.body.addEventListener('oTracking.event', function(event) {
			expect(event.detail.category).to.equal('ads');
			expect(event.detail.action).to.equal('blocked');
			done();
		});
		window.document.dispatchEvent(new Event('sp.blocking'));
	});

	it('should insert the Sourcepoint script to the page', function() {
		document.cookie = 'spoor-id=0123456789;';
		sandbox.stub(flags, 'get').withArgs('sourcepoint').returns(true);
		window.dispatchEvent(new Event('ftNextLoaded'));
		let sourcepointLoaded = checkSourcepointScriptLoaded();
		expect(sourcepointLoaded).to.equal(true);
	});

});
