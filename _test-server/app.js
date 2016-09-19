const fs = require('fs');
const express = require('@financial-times/n-express');
const path = require('path');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;

const app = module.exports = express({
	name: process.env.CIRCLE_BUILD_NUM ? `n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/public` : 'public',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	hasHeadCss: true,
	layoutsDir: path.join(process.cwd(), '/layout'),
	viewsDirectory: '/_test-server/views',
	directory: process.cwd()
});

app.get('/', (req, res) => {
	// such a load of hacks :/
	// in an ideal world we could hack some middleware in
	// before the assets middleware gets applied
	res.locals.javascriptBundles = res.locals.javascriptBundles
		.filter(bundle => {
			return bundle.indexOf('undefined') === -1
		})
		.map(bundle => {
			if (bundle.indexOf('polyfill') === true) {
				return bundle.replace('polyfill.min', 'polyfill').split('&excludes')[0];
			}
			return bundle;
		});
	res.render('default', {
		layout: 'wrapper'
	});
});

app.listen(5005)
	.then(app => {
		// in CI generate a test page and send it to S3
		if (process.env.CIRCLE_BUILD_NUM) {

			fetch('http://localhost:5005/', {
				headers: {
					'FT-Flags': 'ads:off'
				}
			})
				.then(res => res.text())
				.then(text => fs.writeFileSync(path.join(process.cwd(), 'test-page.html'), text))
				.then(() => app.close())
				.then(() => {
					return deployStatic({
						files: ['test-page.html', 'public/main.css', 'public/main-without-n-ui.js', 'public/main.css.map', 'public/main-without-n-ui.js.map'],
						destination: `n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/`,
						bucket: 'ft-next-n-ui-prod',
						cacheControl: 'no-cache, must-revalidate',
					})
						.catch(err => {
							console.error(err) //eslint-disable-line
							process.exit(2);
						});
				})
				.then(() => {
					console.log('deployed test static site to s3'); //eslint-disable-line
					process.exit(0);
				})
				.catch(err => {
					console.error(err) //eslint-disable-line
					process.exit(2)
				})
		}
	});
