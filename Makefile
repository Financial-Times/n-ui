include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config webpack.config.demo.js --bail

deploy: assets
	node ./_deploy/s3.js
	$(MAKE) npm-publish

test: verify test-unit test-build

test-dev: verify test-unit-dev

demo:
	webpack --config webpack.config.demo.js --dev
	nodemon _demo/app
