/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr: true */
const getHref = require('../../../ft/utils/getHref');

describe("getHref", function () {

	const rootEl = document.body;

	beforeEach(function () {
		rootEl.innerHTML = null;
	});

	afterEach(function () {
		rootEl.innerHTML = null;
	});

	it("Exists", function () {
		expect(getHref).to.exist;
	});

	it("Determine the href destination of a trackable element", function () {
		rootEl.innerHTML += '<hello data-trackable="a" id="e" href="abc">hello</hello>';
		const path = getHref(document.getElementById('e'));
		expect(path).to.deep.equal('http://localhost/abc');
	});

	it("Determine the href destination of a trackable element where link has nested elements", function () {
		rootEl.innerHTML += '<a href="c">' +
								'<div>' +
									'<hello data-trackable="a" id="d">hello</h3>' +
								'</div>' +
							'</a>';
		const path = getHref(document.getElementById('d'));
		expect(path).to.deep.equal('http://localhost/c');
	});

	it("Return only the first href found in the DOM hierarchy", function () {
		rootEl.innerHTML += '<a href="a">' +
								'<a href="b">' +
									'<div>' +
										'<hello data-trackable="a" id="d">hello</h3>' +
									'</div>' +
								'</a>' +
							'</a>';
		const path = getHref(document.getElementById('d'));
		expect(path).to.deep.equal('http://localhost/b');
	});

});
