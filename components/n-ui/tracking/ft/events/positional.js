const Delegate = require('ftdomdelegate');

const $ = (q) => [].slice.call(q);

class Positional {

	constructor () {
		this.delegate = new Delegate();
	}

	init (el) {
		$(el.querySelectorAll('[role=main] section'))
			.forEach((section) => {
				$(section.querySelectorAll('article'))
					.forEach((article, index, articles) => {
						$(article.querySelectorAll('a'))
							.forEach(link => {
								link.setAttribute('data-position', index + 1);
								link.setAttribute('data-siblings', articles.length);
							});
					});
			});
	}

	destroy () {
		this.delegate.destroy();
	}
}

module.exports = Positional;
