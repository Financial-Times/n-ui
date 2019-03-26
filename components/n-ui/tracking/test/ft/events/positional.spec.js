/*global describe, it, expect*/
const Positional = require('../../../ft/events/positional');

describe('Positional', function () {
	let p;
	let rootEl;
	before(() => {
		rootEl = document.createElement('div');
		document.body.appendChild(rootEl);
	});
	after(function () {
		rootEl.parentNode.removeChild(rootEl);
		p && p.destroy();
	});

	it('Decorate anchors with positional data', function (done) {
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
