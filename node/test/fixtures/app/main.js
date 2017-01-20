const PORT = process.env.PORT || 3000;
const express = require('../../../index.js');
const yell = require('./src/yell');

const app = module.exports = express({
	directory: __dirname,
	helpers: { yell: yell },
	withLayoutPolling: false,
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

app.get('/with-layout', function (req, res) {
	res.locals.__isProduction = req.query.prod || res.locals.__isProduction;
	res.render('main', {
		layout: 'wrapper',
		title: 'FT',
		items: [1,2,3,4,5],
		text : '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
	});
});


app.get('/non-html', (req, res) => {
	res.set('Content-Type', 'application/json')
	if (req.query.preload) {
		res.linkResource('it.js', {
			rel: 'preload',
			as: 'script'
		}, {hashed: true}),
		res.linkResource('https://place.com/it.js', {
			rel: 'preload',
			as: 'script'
		})
	}
	res.sendStatus(200);
});

const router = new express.Router();

app.use('/router', router);

router.get('/', function (req, res) {
	res.send('Hello router');
});

module.exports.listen = app.listen(PORT);
