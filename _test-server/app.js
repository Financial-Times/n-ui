'use strict';
const fs = require('fs');
const express = require('../server');
const path = require('path');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const chalk = require('chalk');
const errorHighlight = chalk.bold.red;
const highlight = chalk.bold.green;

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
	res.render('default', {
		title: 'Test App',
		layout: 'wrapper'
	});
});

app.use(require('./middleware/assets'));
app.get('/components/:component?', (req, res) => {
	const component = req.params.component;
	const config = require(`../${component}/pa11y-config`);
	const handlebarsDataClone = JSON.parse(JSON.stringify(config.handlebarsData));
	const model = Object.assign({
		title: 'Test App',
		layout: '../layout/vanilla'
	}, handlebarsDataClone);

	res.render(`../../${component}/${config.handlebarsData.template}`, model);
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
		if (process.env.PA11Y) {
			const spawn = require('child_process').spawn;
			const pa11y = spawn('pa11y-ci');

			pa11y.stdout.on('data', (data) => {
				console.log(highlight(`${data}`)); //eslint-disable-line
			});

			pa11y.stderr.on('data', (error) => {
				console.log(errorHighlight(`${error}`)); //eslint-disable-line
			});

			pa11y.on('close', (code) => {
				process.exit(code)
			});
		} else if (process.env.CIRCLE_BUILD_NUM) {
			// in CI generate a test page and send it to S3

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
					process.exit(2);
				})
		}
	});
