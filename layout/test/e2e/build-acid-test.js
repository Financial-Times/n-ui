'use strict';
require('@financial-times/n-handlebars').standalone({
	directory: process.cwd(),
	partialsDir: [process.cwd() + '/templates/'],
	helpers: {
		hashedAsset: function () {
			return 'bundle.js';
		}
	}
}).then(function (handlebars) {;
	handlebars.render('test/e2e/acid.html', {
		flags: {
			javascript: true
		}
	})
		.then(html => {
			require('fs').writeFileSync(process.cwd() + '/test/e2e/build/index.html', html)
		})

})
