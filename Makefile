include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

pre-package:
	bower install n-ui -f --config.registry.search=http://registry.origami.ft.com --config.registry.search=https://bower.herokuapp.com

deploy:
	node ./_deploy/s3.js

dist: pre-package assets deploy

test: verify test-unit

test-dev: verify test-unit-dev

demo:
	webpack --config webpack.config.demo.js --dev
	nodemon _demo/app
