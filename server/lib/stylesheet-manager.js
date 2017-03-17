const logger = require('@financial-times/n-logger').default;
const denodeify = require('denodeify');
const fs = require('fs');
const readFile = denodeify(fs.readFile);
const chokidar = require('chokidar');
const metrics = require('next-metrics');
const gzip = denodeify(require('zlib').gzip);

const concatenatedStylesCache = {};
const concatenatedStylesSizeCache = {};
let stylesheets;

const calculateSize = content => {
	return gzip(content)
		.then(gzipped => ({
			raw: Buffer.byteLength(content),
			gzip: Buffer.byteLength(gzipped)
		}))
}

module.exports = {

	concatenateStyles: stylesheetNames => {
		const hash = stylesheetNames.join(':');
		if (!concatenatedStylesCache[hash]) {
			concatenatedStylesCache[hash] = stylesheetNames.reduce((str, name) => {
				/* istanbul ignore next */
				if (!stylesheets[name]) {
					throw new Error(`Stylesheet ${name}.css does not exist`);
				}
				return str + stylesheets[name];
			}, '');
			concatenatedStylesSizeCache[hash] = calculateSize(concatenatedStylesCache[hash])
		}

		concatenatedStylesSizeCache[hash]
			.then(({raw, gzip}) => {
				metrics.histogram('head_css_size.raw', raw);
				metrics.histogram(`head_css_size.raw.${hash}`, raw);
				metrics.histogram('head_css_size.gzip', gzip);
				metrics.histogram(`head_css_size.gzip.${hash}`, gzip);
			})


		return concatenatedStylesCache[hash];
	},

	init: (options, directory) => {
		const headCsses = fs.readdirSync(`${directory}/public`)
			.filter(name => /\.css$/.test(name))
			.map(name => [name, fs.readFileSync(`${directory}/public/${name}`, 'utf-8')])
			.reduce((currentHeadCsses, currentHeadCss) => {
				currentHeadCsses[currentHeadCss[0].replace('.css', '')] = currentHeadCss[1];
				return currentHeadCsses;
			}, {});

		/* istanbul ignore next */
		if (process.NODE_ENV !== 'production') {
			const paths = Object.keys(headCsses).map(css => `${directory}/public/${css}.css`);
			chokidar.watch(paths)
				.on('change', (path) => {
					readFile(path, 'utf-8').then((content) => {
						const name = path.match(/\/(head.*).css$/)[1];
						headCsses[name] = content;
						logger.info(`Reloaded head CSS: ${name}`);
					});
				})
				.on('unlink', (path) => {
					const name = path.match(/\/(head.*).css$/)[1];
					delete headCsses[name];
					logger.info(`Deleted head CSS: ${name}`);
					logger.warn('Please note you will need to restart app if you add new head CSS files');
				});
		}

		stylesheets = headCsses
	}
}
