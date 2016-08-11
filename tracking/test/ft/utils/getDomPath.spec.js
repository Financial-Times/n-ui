/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr: true */
const getDomPath = require('../../../ft/utils/getDomPath');

describe('getDomPath', function () {

	const rootEl = document.body;

	beforeEach(function () {
		rootEl.innerHTML = null;
	});

	afterEach(function () {
		rootEl.innerHTML = null;
	});

	it('Exists', function () {
		expect(getDomPath).to.exist;
	});

	it('Determine the trackable path of a DOM element', function () {
		rootEl.innerHTML += `<section data-trackable="c">
								<span data-trackable="b">
									<div>
										<button data-trackable="a" id="d"></button>
									</div>
								</span>
							</section>`;
		const path = getDomPath(document.getElementById('d'), []);
		expect(path).to.deep.equal(['a', 'b', 'c']);
	});

	it('Declaratively terminate the trackable DOM path', function () {
		rootEl.innerHTML += `<section data-trackable="c">
								<span data-trackable="b" data-trackable-terminate>
									<div>
										<button data-trackable="a" id="d"></button>
									</div>
								</span>
							</section>`;
		const path = getDomPath(document.getElementById('d'), []);
		expect(path).to.deep.equal(['a', 'b']);
	});

	it('Transpose interactions with text nodes to their parent element', function () {
		rootEl.innerHTML += `<section data-trackable="c">
								<span data-trackable="b" id="a">
								</span>
							</section>`;
		const trackableEl = document.getElementById('a');
		const textNode = document.createTextNode('text node');
		trackableEl.appendChild(textNode);
		const path = getDomPath(trackableEl.firstChild, []);
		expect(path).to.deep.equal(['b', 'c']);
	});

	it('Remove the trackable attribute if instructed to only track the source element once', function () {
		rootEl.innerHTML += `<section data-trackable="c">
														<span data-trackable="b" data-trackable-once id="once">
														</span>
												</section>`;
		const path = getDomPath(document.getElementById('once'), []);
		expect(path).to.deep.equal(['b', 'c']);
		expect(document.getElementById('once').getAttribute('data-trackable')).to.equal(null);
	});

	it('Don\'t remove trackable attributes in the dom path unless it\'s the target element', function () {
		rootEl.innerHTML += `<section data-trackable="c">
														<span data-trackable="b" data-trackable-once id="x1">
							<button data-trackable="b" id="x2">hello</button>
														</span>
												</section>`;
		const path = getDomPath(document.getElementById('x1'), []);
		expect(path).to.deep.equal(['b', 'c']);
	expect(document.getElementById('x2').getAttribute('data-trackable')).to.equal('b');
	});
});
