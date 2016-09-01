const fs = require('fs');
const express = require('@financial-times/n-express');
const path = require('path');
const shellpromise = require('shellpromise');

const app = module.exports = express({
	name: process.env.CIRCLE_BUILD_NUM ? `n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/public` : 'public',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	layoutsDir: path.join(process.cwd(), '/layout'),
	viewsDirectory: '/_test-server/views',
	directory: process.cwd()
});

app.get('/', (req, res) => {
	res.render('default', {
		layout: 'wrapper'
	})
});

app.listen(5005)
	.then(app => {

		console.log('Demo app up and running on port 5005');
		//generate a test page and send it to S3
		fetch('http://localhost:5005/', {
			headers: {
				'FT-Flags': 'ads:off'
			}
		})
			.then(res => res.text())
			.then(text => fs.writeFileSync(path.join(process.cwd(), 'test-page.html'), text))
			.then(() => app.close())
			.then(() => {
				return shellpromise(`nht deploy-static test-page.html public/main.css public/main.js public/main.css.map public/main.js.map --destination n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/ \\
					--bucket ft-next-n-ui-prod \\
					--cache-control 'no-cache, must-revalidate'`, {verbose: true})
					.then(() => process.exit(0))
					.catch(err => {
						console.error(err)
						process.exit(2);
					});
			})
	});
