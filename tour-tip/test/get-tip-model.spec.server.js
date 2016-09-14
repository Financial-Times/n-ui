/*global describe,afterEach,beforeEach,it,expect*/

import {default as getTipModelDefault, getById, getRandomOfSize} from '../get-tip-model';

describe('tour tip get tip model', () => {

	describe('getById', () => {

		it('gets by ID', () => {
			expect(getById('topics-m').id).to.equal('topics-m');
		});

		it('returns undefined if the ID does not exist', () => {
			expect(getById('???')).to.be.undefined;
		});

		it('is the default function', () => {
			expect(getTipModelDefault === getById).to.be.true;
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
