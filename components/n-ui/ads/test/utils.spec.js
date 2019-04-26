/* globals describe, it, beforeEach, afterEach,expect,sinon */
import utils from '../js/utils';
import markup from './helpers/markup';
let windowConsole;
let sandbox;

describe('Utils', () => {

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		markup.setupContainer();
		windowConsole = window.console;
	});

	afterEach(() => {
		sandbox.restore();
		markup.destroyContainer();
		window.console = windowConsole;
	});

	it('Should return a layout name from data-ads-layout attribute', () => {
		const layoutName = 'test-layout-name';
		markup.set('<div data-ads-layout="' + layoutName + '"></div>');
		expect(utils.getLayoutName()).to.equal(layoutName);
	});

	it('Should return a default layout name when no data-ads-layout is present', () => {
		expect(utils.getLayoutName()).to.equal('default');
	});

	it('Should get content of a meta tags content attribute', () => {
		const metaValue = 'a-test-value';
		markup.set('<meta name="test-meta" content="a-test-value">');
		expect(utils.getMetaData('test-meta')).to.equal(metaValue);
	});

	it('Should return false when meta tag with a name not found', () => {
		expect(utils.getMetaData('test-meta')).not.to.be.ok;
	});

	it('Should convert an object to a key value string', () => {
		const testObject1 = {someKey: 'someValue'};
		const testObject2 = {name: 'Test', param: 'value'};
		expect(utils.keyValueString(testObject1)).to.equal('someKey=someValue');
		expect(utils.keyValueString(testObject2)).to.equal('name=Test;param=value');
	});

	it('Should determine if DOM element is empty', () => {
		markup.set('<div class="test-case1"></div>');
		expect(utils.isEmpty(document.querySelector('.test-case1'))).to.be.ok;

		markup.set('<div class="test-case2">test</div>');
		expect(utils.isEmpty(document.querySelector('.test-case2'))).to.be.ok;

		markup.set('<div class="test-case3"><div style="display:none">test</div></div>');
		expect(utils.isEmpty(document.querySelector('.test-case3'))).to.be.ok;

		markup.set('<div class="test-case4"><p>test</p></div>');
		expect(utils.isEmpty(document.querySelector('.test-case4'))).not.to.be.ok;
	});

	it('Should not log messages if debug is off', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => false );
		const logStub = sandbox.spy(window.console, 'log');
		utils.log('test', 'message');
		expect(logStub).not.to.have.been.called;
	});

	it('Should not log messages if console not available', () => {
		const logStub = sandbox.spy(window.console, 'log');
		window.console = undefined;
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		utils.log('test', 'message');
		expect(logStub).not.to.have.been.called;
	});


	it('Should not log messages if console method is not available', () => {
		const logStub = sandbox.spy(window.console, 'log');
		const warnStub = sandbox.spy(window.console, 'warn');
		const errorStub = sandbox.spy(window.console, 'error');
		const infoStub = sandbox.spy(window.console, 'info');
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );

		window.console['log'] = undefined;
		utils.log('log', 'message');
		window.console['warn'] = undefined;
		utils.log('warn', 'message');
		window.console['error'] = undefined;
		utils.log('error', 'message');
		window.console['info'] = undefined;
		utils.log('info', 'message');

		expect(logStub).not.to.have.been.called;
		expect(warnStub).not.to.have.been.called;
		expect(errorStub).not.to.have.been.called;
		expect(infoStub).not.to.have.been.called;
	});


	it('Should default log method to log type', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'log');
		utils.log('message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should default log method to log type - log', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'log');
		utils.log('log', 'message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should take first arguments to log as type - warn', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'warn');
		utils.log('warn', 'message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should take first arguments to log as type - error', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'error');
		utils.log('error', 'message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should take first arguments to log as type - info', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'info');
		utils.log('info', 'message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should provide a wrapper for warn log', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'warn');
		utils.log.warn('message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should provide a wrapper for error log', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'error');
		utils.log.error('message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should provide a wrapper for info log', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const logStub = sandbox.stub(window.console, 'info');
		utils.log.info('message');
		expect(logStub).to.have.been.calledWith('message');
	});

	it('Should provide a wrapper log group start ', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupCollapsedStub = sandbox.stub(window.console, 'groupCollapsed');
		utils.log.start();
		expect(groupCollapsedStub).to.have.been.calledWith('next-ads-component');
	});

	it('Should return early from log group start if groupCollapsed is not available', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupCollapsedStub = sandbox.stub(window.console, 'groupCollapsed');
		window.console['groupCollapsed'] = undefined;
		utils.log.start();
		expect(groupCollapsedStub).not.to.have.been.called;
	});

	it('Should return early from log group start if console is not available', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupCollapsedStub = sandbox.stub(window.console, 'groupCollapsed');
		window.console = undefined;
		utils.log.start();
		expect(groupCollapsedStub).not.to.have.been.called;
	});

	it('Should return early from log group start if debug mode is off', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => false );
		const groupCollapsedStub = sandbox.stub(window.console, 'groupCollapsed');
		utils.log.start();
		expect(groupCollapsedStub).not.to.have.been.called;
	});

	it('Should provide a wrapper for log group end', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupEndStub = sandbox.stub(window.console, 'groupEnd');
		utils.log.end();
		expect(groupEndStub).to.have.been.called;
	});

	it('Should return early from log group end if groupCollapsed is not available', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupEndStub = sandbox.stub(window.console, 'groupEnd');
		window.console['groupEnd'] = undefined;
		utils.log.end();
		expect(groupEndStub).not.to.have.been.called;
	});

	it('Should return early from log group end if console is not available', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => true );
		const groupEndStub = sandbox.stub(window.console, 'groupEnd');
		window.console = undefined;
		utils.log.end();
		expect(groupEndStub).not.to.have.been.called;
	});

	it('Should return early from log group end if debug mode is off', () => {
		sandbox.stub(utils.log, 'isOn').callsFake(() => false );
		const groupEndStub = sandbox.stub(window.console, 'groupEnd');
		utils.log.end();
		expect(groupEndStub).not.to.have.been.called;
	});

	it('Should return document.referrer', () => {
		expect(utils.getReferrer()).to.equal(document.referrer);
	});


});
