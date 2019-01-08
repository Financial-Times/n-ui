const request = require('supertest');
const nextExpress = require('../index');
const expect = require('chai').expect;

describe('current year middleware', () => {
	let app;
	let locals;

	before(() => {
		app = nextExpress({
			systemCode: 'server unit tests', // mandatory option
			withAssets: false // else test server won't start
		});
		app.get('/', function (req, res) {
			locals = res.locals;
			res.sendStatus(200).end();
		});
	});

	it('should set the res.locals.currentYear property', (done) => {
		request(app)
			.get('/')
			.expect(() => {
				expect(locals).to.have.own.property('currentYear');
			})
			.end(done);
	});

	it('should set the res.locals.currentYear property to 2019', (done) => {
		request(app)
			.get('/')
			.expect(() => {
				expect(locals).to.have.own.property('currentYear');
				// this will break every year, but better to be sure it's working
				// than using the same code logic to validate the year
				expect(locals.currentYear).to.equal(2019);
			})
			.end(done);
	});
});
