const path = require('path');
const fs = require('fs');
const denodeify = require('denodeify');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);
const shellpromise = require('shellpromise');

const Handlebars = require('@financial-times/n-handlebars');

Handlebars.standalone({
	layoutsDir: path.join(process.cwd(), '/layout/'),
	helpers: {},
	directory: process.cwd()
})
	.then(hbs =>
		shellpromise('mkdir ./dist/templates')
			.catch(() => null)
			.then(() => shellpromise('ls ./layout/*.html'))
			.then(files => Promise.all(
				files.split('\n')
					.filter(file => !!file)
					.map(file =>
						readFile(path.join(process.cwd(), file), 'utf8')
							.then(contents => hbs.handlebars.precompile(contents))
							.then(precompiled => {
								const destination = path.join(process.cwd(), 'dist/templates', `${file.split('/').pop()}.precompiled`);
								return writeFile(destination, precompiled)
							})
					)
			))
	)
	.then(() => process.exit(0))
	.catch(err => {
		console.log(err)  //eslint-disable-line
		process.exit(2)
	})
