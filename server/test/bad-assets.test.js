const shellpromise = require('shellpromise');
const expect = require('chai').expect;
const join = require('path').join;
const appPath = join(__dirname, './fixtures/bad-assets');

function appStart () {
	return shellpromise(`node -e "require('${appPath}/main').listen.then(() => { console.log('event=SUCCESS'); process.exit(); });"`
		//, { verbose: true } // to debug tests, uncomment this line
	);
}

function createGitignore () {
	require('fs').writeFileSync(`${appPath}/.gitignore`, [].slice.call(arguments).join('\n'));
}

describe('built asset expectations', () => {
	before(() => shellpromise(`mkdir -p ${appPath}/public`, { verbose: true }));

	// otherwise fails linting
	after(() => shellpromise(`rm ${appPath}/.gitignore`, { verbose: true }));
	beforeEach(() => Promise.all([
		shellpromise(`touch ${appPath}/public/main.js`),
		shellpromise(`touch ${appPath}/public/main.css`)
	]));

	it('should fail to start if there is a missing asset', async () => {
		createGitignore('/public/main.js', '/public/main.css');
		await shellpromise(`rm -rf ${appPath}/public/main.js`, { verbose: true });
		try {
			await appStart();
			throw new Error('app should not have successfully started');
		} catch (err) {
			expect(err.toString()).to.contain('main.js');
		}
	});

	it('should start if assets and gitignore match', async () => {
		createGitignore('/public/main.js', '/public/main.css', '/public/about.json');
		await shellpromise(`touch ${appPath}/public/about.json`);
		await appStart();
	});
});
