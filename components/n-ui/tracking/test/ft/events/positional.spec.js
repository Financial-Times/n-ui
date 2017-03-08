/*global describe, it, expect, afterEach*/
const Positional = require('../../../ft/events/positional');

describe('Positional', function () {
	let p;

	afterEach(function () {
		document.body.innerHTML = '';
		p && p.destroy();
	});

	it('Decorate anchors with positional data', function (done) {
		const rootEl = document.body;
		rootEl.innerHTML += `<div data-next-app='front-page'><div role='main'>
					<section>
						<article><a data-trackable='xyz' id='a'>hello</a></article>
						<article><a data-trackable='xyz' id='b'>world</a></article>
						<article><a data-trackable='xyz' id='c'>hello</a></article>
					</section>
				'</div></div>`;
		p = new Positional();
		p.init(rootEl);
		const a = document.getElementById('a');
		const c = document.getElementById('a');
		expect(a.getAttribute('data-position')).to.equal('1');
		expect(c.getAttribute('data-siblings')).to.equal('3');
		done();
	});

});
