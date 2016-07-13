/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr: true */
const getDomPathString = require('../../../ft/utils/getDomPathString');

describe('getDomPathString', function () {

	let div;

	beforeEach(function () {
		div = document.createElement('div');
		document.body.appendChild(div);
	});

	afterEach(function () {
		document.body.removeChild(div);
	});

	it('Exists', function () {
		expect(getDomPathString).to.exist;
	});

	it('Display the trackable path of a DOM element in outer to inner order in string format', function () {
		div.innerHTML += `
			<section data-trackable="c">
				<span data-trackable="b">
					<div>
						<button data-trackable="a" id="d"></button>
					</div>
				</span>
			</section>
		`;
		const path = getDomPathString(document.getElementById('d'));
		expect(path).to.equal('c | b | a');
	});
});
