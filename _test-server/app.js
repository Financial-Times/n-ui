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
	partialsDirectory: process.cwd(),
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
			if (bundle.indexOf('polyfill') > -1) {
				return bundle.replace('polyfill.min', 'polyfill')
					.split('&excludes')[0];
			}
			return bundle;
		});
	res.render('default', {
		title: 'Test App',
		layout: 'wrapper'
	});
});

app.get('/components/:component?', (req, res) => {
	const component = req.params.component;
	const template = fs.readdirSync(`./${component}`).filter((file) => {
		return file.match(/.html$/);
	})[0].slice(0, -5);

	// such a load of hacks :/
	// in an ideal world we could hack some middleware in
	// before the assets middleware gets applied
	res.locals.javascriptBundles = res.locals.javascriptBundles
		.filter(bundle => {
			return bundle.indexOf('undefined') === -1
		})
		.map(bundle => {
			if (bundle.indexOf('polyfill') > -1) {
				return bundle.replace('polyfill.min', 'polyfill')
					.split('&excludes')[0];
			}
			return bundle;
		});
	res.render('default', {
		pa11y: true,
		title: 'Test App',
		layout: '../_test-server/views/component-wrapper',
		template: `${component}/${template}`
	});
});

app.get('*', (req, res) => {
	fetch('https://www.ft.com' + req.originalUrl, {
		headers: req._headers,
		method: req.method
	})
		.then(response => {
			response.body.pipe(res);
		})
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
