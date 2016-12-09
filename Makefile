include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config webpack.config.test.js

demo: run

run:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

nightwatch:
	nht nightwatch test/js-success.nightwatch.js

test: verify test-unit test-build serve nightwatch a11y

a11y: test-build
	node .pa11yci.js
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	PA11Y=true node _test-server/app


test-dev: verify test-unit-dev

deploy: assets
	node ./_deploy/s3.js
	$(MAKE) npm-publish

build:
	webpack --config webpack.config.test.js --dev

watch:
	webpack --config webpack.config.test.js --dev --watch

serve:
	@echo '`make serve` is no longer needed to bower link.'
	@echo 'Instead set the environment variable `NEXT_APP_SHELL=local` in your app'
	@echo 'and run `make build run` etc in the app'
	exit 2
