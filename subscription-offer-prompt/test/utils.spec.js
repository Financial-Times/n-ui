/* globals describe, it, beforeEach, afterEach, expect, sinon */
import {
	negate, any, anyTrue, noneTrue, result, resultExists, executeWhen,
	getStorage, getSessionStorage, setStorage, getCookie,
	difference, dateInFuture, addToDate,
	element, elementExists, createElement,
} from '../utils';

const _localStorage = window.localStorage;
const _sessionStorage = window.sessionStorage;
function fakeStorage (session) {
	Object.defineProperty(window, session ? 'sessionStorage' : 'localStorage', {
		enumerable: true,
		configurable: true,
		value: {
			getItem: sinon.stub(),
			setItem: sinon.stub(),
			removeItem: sinon.stub(),
			key: sinon.stub(),
			restore: () => {
				Object.defineProperty(window, session ? 'sessionStorage' : 'localStorage', {
					enumerable: true,
					configurable: true,
					get: () => session ? _sessionStorage : _localStorage,
				});
			},
		},
	});
}

describe('Subscription Offer Prompt - Utils', () => {

	describe('negate', () => {

		it('returns a function', () =>
			expect( negate() ).to.be.a('function')
		);

		it('turns true to false', () =>
			expect( negate(() => true)() ).to.equal(false)
		);

		it('turns false to true', () =>
			expect( negate(() => false)() ).to.equal(true)
		);

		it('passes arguments to function', () =>
			negate((a, b) => expect([a, b]).to.eql([1, 2]))(1, 2)
		);

	});

	describe('any', () => {

		it('returns a function', () =>
			expect( any() ).to.be.a('function')
		);

		it('returns true if one given value makes callback return true', () =>
			expect( any((value) => value === 1)(2, 3, 1) ).to.equal(true)
		);

		it('returns false if no given values makes callback return true', () =>
			expect( any((value) => value === 1)(2, 3, 4) ).to.equal(false)
		);

	});

	describe('anyTrue', () => {

		it('call returns true for any truthy values', () =>
			expect( anyTrue(true, true, true) ).to.equal(true)
		);

		it('call returns false if no values are truthy', () =>
			expect( anyTrue(false, false, false) ).to.equal(false)
		);

		it('call returns true if some values are truthy', () =>
			expect( anyTrue(false, false, true) ).to.equal(true)
		);

		it('calls functions if given (true)', () =>
			expect( anyTrue(() => false, () => false, () => true) ).to.equal(true)
		);

		it('calls functions if given (false)', () =>
			expect( anyTrue(() => false, () => false, () => false) ).to.equal(false)
		);

	});

	describe('noneTrue', () => {

		it('call returns false for any truthy values', () =>
			expect( noneTrue(true, true, true) ).to.equal(false)
		);

		it('call returns true if no values are truthy', () =>
			expect( noneTrue(false, false, false) ).to.equal(true)
		);

		it('call returns false if some values are truthy', () =>
			expect( noneTrue(false, false, true) ).to.equal(false)
		);

		it('calls functions if given (true)', () =>
			expect( noneTrue(() => false, () => false, () => false) ).to.equal(true)
		);

		it('calls functions if given (false)', () =>
			expect( noneTrue(() => false, () => false, () => true) ).to.equal(false)
		);

	});

	describe('result', () => {

		it('returns function return value, if given value is a function', () => {
			expect( result(() => 1) ).to.equal(1);
			expect( result(() => 'a') ).to.equal('a');
		});

		it('returns value if it is not a function', () => {
			expect( result(1) ).to.equal(1);
			expect( result('a') ).to.equal('a');
		});

	});

	describe('resultExists', () => {

		it('returns a function', () =>
			expect( resultExists() ).to.be.a('function')
		);

		it('call returns true if result is not null/undefined', () => {
			expect( resultExists(1)() ).to.equal(true);
			expect( resultExists('a')() ).to.equal(true);
			expect( resultExists(false)() ).to.equal(true);
		});

		it('call returns false if result is null/undefined', () => {
			expect( resultExists(undefined)() ).to.equal(false);
			expect( resultExists(null)() ).to.equal(false);
		});

		it('call calls function and returns true if result is not null/undefined', () => {
			expect( resultExists(() => 1)() ).to.equal(true);
			expect( resultExists(() => 'a')() ).to.equal(true);
			expect( resultExists(() => false)() ).to.equal(true);
		});

		it('call calls function and returns false if result is null/undefined', () => {
			expect( resultExists(() => undefined)() ).to.equal(false);
			expect( resultExists(() => null)() ).to.equal(false);
		});

		it('call calls function lazily', () => {
			let result = null;
			const func = resultExists(() => result = (result === null ? 1 : null));
			expect( func() ).to.equal(true);
			expect( func() ).to.equal(false);
			expect( func() ).to.equal(true);
			expect( func() ).to.equal(false);
		});

	});

	describe('executeWhen', () => {

		it('returns a function', () =>
			expect( executeWhen() ).to.be.a('function')
		);

		it('calls passed function and returns value if given truthy', () => {
			let func = sinon.stub().returns('foo');
			let value = executeWhen(func)(true);
			expect(func).to.have.been.calledOnce;
			expect(value).to.equal('foo');
		});

		it('does not call passed function and returns undefined if given falsey', () => {
			let func = sinon.stub();
			let value = executeWhen(func)(false);
			expect(func).to.not.have.been.called;
			expect(value).to.equal(undefined);
		});

	});

	describe('getStorage', () => {

		beforeEach(() => fakeStorage());

		afterEach(() => localStorage.restore());

		it('returns a function', () =>
			expect( getStorage() ).to.be.a('function')
		);

		it('call calls localStorage.getItem(key) ', () => {
			const getFoo = getStorage('foo');
			expect( localStorage.getItem ).to.not.have.been.called;
			getFoo();
			expect( localStorage.getItem ).to.have.been.calledWithExactly('foo');
		});

	});

	describe('getSessionStorage', () => {

		beforeEach(() => fakeStorage('session'));

		afterEach(() => sessionStorage.restore());

		it('returns a function', () =>
			expect( getSessionStorage() ).to.be.a('function')
		);

		it('call calls sessionStorage.getItem(key) ', () => {
			const getFoo = getSessionStorage('foo');
			expect( sessionStorage.getItem ).to.not.have.been.called;
			getFoo();
			expect( sessionStorage.getItem ).to.have.been.calledWithExactly('foo');
		});

	});

	describe('setStorage', () => {

		beforeEach(() => fakeStorage());

		afterEach(() => localStorage.restore());

		it('returns a function', () =>
			expect( setStorage() ).to.be.a('function')
		);

		it('call calls localStorage.setItem(key, value) ', () => {
			const setFoo = setStorage('foo');
			expect( localStorage.setItem ).to.not.have.been.called;
			setFoo('bar');
			expect( localStorage.setItem ).to.have.been.calledWithExactly('foo', 'bar');
		});

		it('calls value if function, passes to localStorage.setItem(key, value) ', () => {
			const setFoo = setStorage('foo');
			expect( localStorage.setItem ).to.not.have.been.called;
			setFoo(() => 'bar');
			expect( localStorage.setItem ).to.have.been.calledWithExactly('foo', 'bar');
		});

	});

	describe('getCookie', () => {

		beforeEach(() => Object.defineProperty(document, 'cookie', {
			get: () => 'foo=bar; bar=baz',
			configurable: true,
		}));

		afterEach(() => delete document.cookie);

		it('returns a function', () =>
			expect( getCookie() ).to.be.a('function')
		);

		it('call returns cookie value of given key', () => {
			expect( getCookie('foo')() ).to.equal('bar');
			expect( getCookie('bar')() ).to.equal('baz');
		});

	});

	describe('difference', () => {

		it('returns a function', () =>
			expect( difference() ).to.be.a('function')
		);

		it('returns difference between given args', () => {
			expect( difference(2)(1) ).to.equal(1);
			expect( difference(6)(3) ).to.equal(3);
			expect( difference(1000)(2000) ).to.equal(-1000);
		});

		it('uses return value if given functions', () => {
			expect( difference(() => 2)(() => 1) ).to.equal(1);
			expect( difference(() => 6)(() => 3) ).to.equal(3);
			expect( difference(() => 1000)(() => 2000) ).to.equal(-1000);
		});

		it('executes functions lazily', () => {
			let valueA = 2;
			const diff = difference(() => valueA);
			expect( diff(1) ).to.equal(1);
			valueA = 6;
			expect( diff(3) ).to.equal(3);
			valueA = 1000;
			expect( diff(2000) ).to.equal(-1000);
		});

	});

	describe('dateInFuture', () => {

		it('returns a function', () =>
			expect( dateInFuture() ).to.be.a('function')
		);

		it('call returns true if date in future', () =>
			expect( dateInFuture(Date.now() + 10000)() ).to.equal(true)
		);

		it('call returns false if date in past', () =>
			expect( dateInFuture(Date.now() - 10000)() ).to.equal(false)
		);

		it('call returns false if date in present', () =>
			expect( dateInFuture(Date.now())() ).to.equal(false)
		);

		it('uses return value if given function', () => {
			expect( dateInFuture(() => Date.now())() ).to.equal(false);
			expect( dateInFuture(() => Date.now() + 1000)() ).to.equal(true);
			expect( dateInFuture(() => Date.now() - 1000)() ).to.equal(false);
		});

	});

	describe('addToDate', () => {

		it('returns a function', () =>
			expect( addToDate() ).to.be.a('function')
		);

		it('call returns new Date based on value plus given number', () =>
			// need a 1-2ms buffer for slow JS engines or busy CPUs
			expect( addToDate(10000)(Date.now()).getTime() ).to.be.closeTo(Date.now() + 10000, 2)
		);

		it('uses return value if given function', () => {
			// need a 1-2ms buffer for slow JS engines or busy CPUs
			expect( addToDate(10000)(Date.now).getTime() ).to.be.closeTo(Date.now() + 10000, 2);
			expect( addToDate(() => 10000)(Date.now).getTime() ).to.be.closeTo(Date.now() + 10000, 2);
		});

		it('executes functions lazily', () => {
			let addValue = 10000;
			const add = addToDate(() => addValue);
			// need a 1-2ms buffer for slow JS engines or busy CPUs
			expect( add(Date.now).getTime() ).to.be.closeTo(Date.now() + 10000, 2);
			addValue = 99;
			expect( add(Date.now).getTime() ).to.be.closeTo(Date.now() + 99, 2);
		});

	});

	describe('element', () => {

		beforeEach(() => sinon.stub(document, 'querySelector'));
		afterEach(() => document.querySelector.restore());

		it('returns a function', () =>
			expect( element() ).to.be.a('function')
		);

		it('call returns document.querySelector return value', () => {
			const el = {};
			document.querySelector.returns(el);
			expect( element('bar')() ).to.equal(el);
			expect( document.querySelector ).to.have.been.calledWithExactly('bar');
		});

	});

	describe('elementExists', () => {

		beforeEach(() => sinon.stub(document, 'querySelector'));
		afterEach(() => document.querySelector.restore());

		it('returns a function', () =>
			expect( elementExists() ).to.be.a('function')
		);

		it('call returns false if element not present', () => {
			document.querySelector.returns({});
			expect( elementExists('bar')() ).to.equal(true);
			expect( document.querySelector ).to.have.been.calledWithExactly('bar');
		});

		it('call returns false if element not present', () => {
			document.querySelector.returns(null);
			expect( elementExists('bar')() ).to.equal(false);
			expect( document.querySelector ).to.have.been.calledWithExactly('bar');
		});

		it('executes qSA lazily', () => {
			const barExists = elementExists('bar');
			document.querySelector.returns(null);
			expect( barExists() ).to.equal(false);
			expect( document.querySelector ).to.have.been.calledWithExactly('bar');
			document.querySelector.returns({});
			expect( barExists() ).to.equal(true);
			expect( document.querySelector ).to.have.been.calledWithExactly('bar');
		});

	});

	describe('createElement', () => {

		it('creates given element type', () => {
			expect(createElement('div').tagName).to.equal('DIV');
			expect(createElement('section').tagName).to.equal('SECTION');
		});

		it('assigns attribute from given attribute hash', () => {
			expect(createElement('div', { 'data-foo': 'bar' }).getAttribute('data-foo')).to.equal('bar');
		});

		it('assigns innerHTML to given html', () => {
			const el = createElement('div', {}, '<strong>Foo</strong>');
			expect(el.children.length).to.equal(1);
			expect(el.children[0].tagName).to.equal('STRONG');
			expect(el.children[0].textContent).to.equal('Foo');
		});

	});

});
