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
		}));
};

module.exports = {

	concatenateStyles: stylesheetNames => {
		const hash = stylesheetNames.join(':');
		if (!concatenatedStylesCache[hash]) {
			concatenatedStylesCache[hash] = stylesheetNames.reduce((str, name) => {
				/* istanbul ignore next */
				if (!stylesheets[name]) {
					throw new Error(`Stylesheet ${name}.css does not exist`);
				}
				// remove source maps from inlined css as browser will error
				return str + stylesheets[name].replace(/\/\*# sourceMappingURL=.*\*\//, '');
			}, '');
			concatenatedStylesSizeCache[hash] = calculateSize(concatenatedStylesCache[hash]);
		}
		// HACK: don't measure size when only head-n-ui-core is included as, almost certainly,
		// it's just a html fragment, not a full page load, so no inline css will actually be output
		// TODO - in next major version only do the asset linking (including inclusion of n-ui stylesheets)
		// if the developer explicitly invokes it
		if (stylesheetNames.length > 1 || stylesheetNames[0] !== 'n-ui/head-n-ui-core') {
			concatenatedStylesSizeCache[hash]
				.then(({raw, gzip}) => {
					metrics.histogram('head_css_size.raw', raw);
					metrics.histogram(`head_css_size.raw.${hash}`, raw);
					metrics.histogram('head_css_size.gzip', gzip);
					metrics.histogram(`head_css_size.gzip.${hash}`, gzip);
				});
		}

		return concatenatedStylesCache[hash];
	},

	nameToUrlConfig: name => {
		const result = {file: `${name}.css`};
		if (/n-ui/.test(name)) {
			result.isNUi = true;
		}
		return result
	},

	init: directory => {
		let stylesheetList = fs.readdirSync(`${directory}/public`);
		try {
			fs.statSync(`${directory}/public/n-ui`);
			stylesheetList = stylesheetList.concat(
				fs.readdirSync(`${directory}/public/n-ui`)
					.map(name => `n-ui/${name}`)
			);
		} catch (e) {}

		stylesheets = stylesheetList
			.filter(name => /\.css$/.test(name))
			.map(name => ({name, contents: fs.readFileSync(`${directory}/public/${name}`, 'utf-8')}))
			.reduce((map, {name, contents}) => {
				map[name.replace('.css', '')] = contents;
				return map;
			}, {});

		/* istanbul ignore next */
		if (process.NODE_ENV !== 'production') {
			const paths = Object.keys(stylesheets).map(css => `${directory}/public/${css}.css`);
			chokidar.watch(paths)
				.on('change', (path) => {
					readFile(path, 'utf-8').then((content) => {
						let name = path.split('/');
						name = name[name.length - 1].slice(0, -4);
						concatenatedStylesCache = {};
						stylesheets[name] = content;
						logger.info(`Reloaded head CSS: ${name}`);
					});
				})
				.on('unlink', (path) => {
					let name = path.split('/');
					name = name[name.length - 1].slice(0, -4);
					delete stylesheets[name];
					logger.info(`Deleted head CSS: ${name}`);
					logger.warn('Please note you will need to restart app if you add new head CSS files');
				});
		}
	}
};
