const expect = require('chai').expect;
const nUiWebpack = require('../build/webpack/webpack.config.js');

// TODO: make this test good, if we can. maybe we can't? ¯\_(ツ)_/¯

describe.skip('nUiWebpack', () => {
	let output = nUiWebpack({
		entry: 'main.js',
		withHeadCss: true,
		handleReact: true,
		usePreact: true,
		outputStats: 'myStatsFile.json'
	});
	it('should generate a webpack configuration object with appropriate values', () => {
		expect(output.entry).to.be.a('string');
		expect(output.devtool).to.be.a('string');
		expect(output.plugins).to.be.an('array');
		expect(output.sassLoader).to.be.an('object');
		expect(output.postcss).to.be.a('function');
		expect(output.output.filename).to.be.a('string');
		expect(output.module.loaders).to.be.an('array');
		expect(output.resolve.root).to.be.an('array');
		expect(output.resolve.alias).to.be.an('object');
		expect(output.resolveLoader.alias).to.be.an('object');
		expect(output.resolveLoader.alias.raw).to.be.a('string');
		expect(output.resolveLoader.alias.imports).to.be.a('string');
		expect(output.resolveLoader.alias.postcss).to.be.a('string');
		expect(output.resolveLoader.alias.sass).to.be.a('string');
	});
});
