const join = require('path').join;
const fs = require('fs');

module.exports = () => {
	const gitignore = fs.readFileSync(join(process.cwd(), '.gitignore'), 'utf8')
		.split('\n');
	gitignore.forEach(pattern => {
		if (/^\/?public\/(.*\/\*|\*|$)/.test(pattern)) {
			if (pattern !== '/public/n-ui/') {
				throw new Error('Wildcard pattern or entire directories (i.e. /public/) for built public assets not allowed in your .gitignore. Please specify a path for each file');
			}
		}
	});
};
