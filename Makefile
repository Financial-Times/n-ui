include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config webpack.config.demo.js

pre-package:
	rm -rf bower_components/n-ui 2>/dev/null
	mkdir bower_components/n-ui 2>/dev/null
	cp -f env.scss bower_components/n-ui/env.scss

build: pre-package assets

deploy: build
	node ./_deploy/s3.js

test: verify test-unit test-build

test-dev: verify test-unit-dev

demo:
	webpack --config webpack.config.demo.js --dev
	nodemon _demo/app
