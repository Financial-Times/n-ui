const PORT = process.env.PORT || 3000;
const express = require('../../../index.js');
const yell = require('./src/yell');

const app = module.exports = express({
	systemCode: 'n-ui-test',
	directory: __dirname,
	helpers: { yell: yell },
	layoutsDir: __dirname + '/views/'
});

app.get('/', function (req, res) {
	res.send('Hello world');
});

app.get('/__flags.json', function (req, res) {
	res.send(res.locals.flags);
});

app.get('/templated', function (req, res) {
	res.render('main', Object.assign({
		title: 'FT',
		image: 'https://avatars0.githubusercontent.com/u/3502508?v=3',
		date: new Date('Fri Aug 01 2014 00:00:00 GMT'),
		text : '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>',
		block1default: 'block1default',
		block2default: 'block2default',
		block2override: 'block2override',
		thing1: 'thing1',
		thing2: 'thing2',
		thing3: 'thing3',
		items: [1,2,3,4,5],
		obj: {prop: 'val'},
		partial: 'partial',
		rootVar: 'iamroot'
	}, req.query || {}));
});

app.get('/css-variants', function (req, res) {
	res.locals.stylesheets = {
		inline: req.query.inline ? req.query.inline.split(',') : [],
		blocking: req.query.blocking ? req.query.blocking.split(',') : [],
		lazy: req.query.lazy ? req.query.lazy.split(',') : []
	};
	res.render('main', {
		layout: 'wrapper',
		title: 'FT',
		items: [1,2,3,4,5],
		text : '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
	});
});

app.get('/route-specific-js', function (req, res) {
	res.locals.javascriptBundles.push({ file: req.app.getHashedAssetUrl('route-specific.js') });
	res.render('main', {
		layout: 'wrapper',
		title: 'FT',
		items: [1,2,3,4,5],
		text : '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
	});
});


app.get('/with-layout', function (req, res) {
	res.locals.__isProduction = req.query.prod || res.locals.__isProduction;
	if (req.query.preload) {
		res.linkResource('it.js', {
			rel: 'preload',
			as: 'script'
		}, {hashed: true}),
		res.linkResource('https://place.com/it.js', {
			rel: 'preload',
			as: 'script'
		});
	}
	res.render('main', Object.assign({
		layout: 'wrapper',
		title: 'FT',
		items: [1,2,3,4,5],
		text : '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
	}, req.query || {}));
});


app.get('/non-html', (req, res) => {
	res.set('Content-Type', 'application/json');

	res.sendStatus(200);
});

const router = new express.Router();

app.use('/router', router);

router.get('/', function (req, res) {
	res.send('Hello router');
});

module.exports.listen = app.listen(PORT);
