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
	// pre-empt the roll out of this flag
	res.locals.flags.polyfillSymbol = true;
	res.render('default', {
		layout: 'wrapper'
	}, (err, text) => {
		// hack - the app will try to bring in a built n-ui from the network
		// so we get rid of it
		res.send(text.replace(
			/ftNextLoadScript\('undefined.*/,
			''
		));
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
