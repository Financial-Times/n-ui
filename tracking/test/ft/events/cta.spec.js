/*global describe, it, expect, afterEach*/
const CTA = require('../../../ft/events/cta');
const helpers = require('../../helpers.js');

describe("CTA", function () {
	let cta;

	afterEach(function () {
		document.body.innerHTML = '';
		cta && cta.destroy();
	});

	it("Exists", function () {
		expect(CTA).to.exist;
	});

	it("Track call-to-actions that are marked 'trackable'", function(done) {
		const rootEl = document.body;
		rootEl.innerHTML += '<div data-trackable="abc"><a data-trackable="xyz" id="a" target="_blank" href="http://foo.com/foo" data-position="1" data-siblings="4">hello</a></div>';
		rootEl.addEventListener('oTracking.event', function listener(e) {
			expect(e.detail.nodeName).to.equal('a');
			expect(e.detail.domPath).to.equal('abc | xyz');
			expect(e.detail.domPathTokens).to.eql(['abc', 'xyz']);
			expect(e.detail.target).to.equal('xyz');
			expect(e.detail.textContent).to.equal('hello');
			expect(e.detail.destination).to.equal('http://foo.com/foo');
			expect(e.detail.position).to.equal(1);
			expect(e.detail.siblings).to.equal(4);
			rootEl.removeEventListener('oTracking.event', listener);
			done();
		});
		cta = new CTA();
		cta.track(rootEl);
		helpers.click(document.getElementById('a'));  // simulate a click
	});

	it("Possible to terminate the dompath", function(done) {
		const rootEl = document.body;
		rootEl.innerHTML += '<div data-trackable="abc"><button data-trackable="xyz" data-trackable-terminate id="a">hello</button></div>';
		rootEl.addEventListener('oTracking.event', function listener (e) {
			expect(e.detail.nodeName).to.equal('button');
			expect(e.detail.domPath).to.equal('xyz');
			expect(e.detail.domPathTokens).to.eql(['xyz']);
			expect(e.detail.target).to.equal('xyz');
			rootEl.removeEventListener('oTracking.event', listener);
			done();
		});
		cta = new CTA();
		cta.track(rootEl);
		helpers.click(document.getElementById('a'));  // simulate a click
	});


	it("Track call-to-actions with extra metadata", function(done) {
		const rootEl = document.body;
		rootEl.innerHTML += '<button data-trackable="xyz" data-trackable-meta="{&quot;prop&quot;: &quot;val&quot;}" id="a">hello</button>';
		rootEl.addEventListener('oTracking.event', function listener (e) {
			expect(e.detail.prop).to.equal('val');
			rootEl.removeEventListener('oTracking.event', listener);
			done();
		});
		cta = new CTA();
		cta.track(rootEl);
		helpers.click(document.getElementById('a'));  // simulate a click
	});

	it.skip("Track stateful call-to-actions", function(done) {
		const rootEl = document.body;
		rootEl.innerHTML += '<div data-trackable="abc"><button data-trackable="xyz" role="button" aria-pressed="true" aria-expanded="false" id="a">hello</button></div>';
		rootEl.addEventListener('oTracking.event', function listener(e) {
			expect(e.detail.aria.pressed).to.be.false;
			expect(e.detail.aria.expanded).to.be.true;
			expect(e.detail.aria.role).to.equal('button');
			rootEl.removeEventListener('oTracking.event', listener);
			done();
		});
		cta = new CTA();
		cta.track(rootEl);
		helpers.click(document.getElementById('a'));  // simulate a click
	});

	it('Don\'t track div (i.e. non-link, -button, -input[type="checkbox"]) elements', function(done) {
		const rootEl = document.body;
		const listener = function() {
			expect.fail();
		};
		rootEl.innerHTML += '<div data-trackable="abc" id="div"></div>';
		rootEl.addEventListener('oTracking.event', listener);
		cta = new CTA();
		cta.track(rootEl);
		helpers.click(document.getElementById('div'));  // simulate a click
		rootEl.removeEventListener('oTracking.event', listener);
		done();
	});

	[
		{
			clickElement: 'a',
			html: '<a href="#" data-trackable="abc"></a>'
		},
		{
			clickElement: 'button',
			html: '<button data-trackable="abc"></button>'
		},
		{
			clickElement: 'input[type="checkbox"]',
			html: '<input type="checkbox" data-trackable="abc">'
		}
	].forEach(function (testConfig) {
		it('Tracks ' + testConfig.clickElement + ' elements', function(done) {
			const rootEl = document.body;
			rootEl.innerHTML += testConfig.html;
			rootEl.addEventListener('oTracking.event', function listener() {
				rootEl.removeEventListener('oTracking.event', listener);
				done();
			});
			cta = new CTA();
			cta.track(rootEl);
			helpers.click(document.querySelector(testConfig.clickElement));
		});
	});

});
