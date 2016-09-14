import mockery from 'mockery';
import {expect} from 'chai';
import configFixture from './config-fixture.json';

describe('tour tip get tip model', () => {
	let getTipModel;
	let getById;
	let getRandomOfSize;

	before(() => {
		mockery.enable();
		// Mockery warns about >20 Babel plugins if we don’t silence this
		mockery.warnOnUnregistered(false);
		mockery.registerMock('./config.json', configFixture);
		getTipModel = require('../get-tip-model');
		getById = getTipModel.getById;
		getRandomOfSize = getTipModel.getRandomOfSize;
	});

	after(() => {
		mockery.disable();
	});

	describe('getById', () => {

		it('gets by ID', () => {
			expect(getById('topics-m').id).to.equal('topics-m');
		});

		it('returns undefined if the ID does not exist', () => {
			expect(getById('???')).to.be.undefined;
		});

		it('is the default function', () => {
			expect(getTipModel.default === getById).to.be.true;
		});

	});

	describe('getRandomOfSize', () => {

		it('gets a random one of the correct size', () => {
			expect(getRandomOfSize('m').settings.size).to.equal('m');
		});

		it('returns undefined if no tips exist of the requested size', () => {
			expect(getRandomOfSize('???')).to.be.undefined;
		});

	});
});
