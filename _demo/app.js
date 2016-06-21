const express = require('@financial-times/n-express');
const path = require('path');

const app = module.exports = express({
	name: 'n-ui/demo',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	layoutsDir: path.join(process.cwd(), '/layout'),
	viewsDirectory: '/_demo/views',
	directory: process.cwd()
});


app.get('/', (req, res) => {
	res.render('default', {
		layout: 'wrapper'
	})
});

app.listen(5005, () => {
	console.log('Demo app up and running on port 5005');
});
