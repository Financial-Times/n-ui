include n.Makefile

demo: run

run:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

build:
	webpack --config webpack.config.demo.js --dev

watch:
	webpack --config webpack.config.demo.js --dev --watch

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config webpack.config.demo.js

test-server: export FT_NEXT_BACKEND_KEY=test-backend-key
test-server: export FT_NEXT_BACKEND_KEY_OLD=test-backend-key-old
test-server: export FT_NEXT_BACKEND_KEY_OLDEST=test-backend-key-oldest
test-server:
	cp layout/partials/stylesheets.html node/test/fixtures/app/views/partials
	mocha node/test/*.test.js node/test/**/*.test.js  --recursive

nightwatch:
	nht nightwatch test/js-success.nightwatch.js

pally-conf:
	node .pa11yci.js

a11y: test-build pally-conf
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	PA11Y=true node _test-server/app

test: verify pally-conf test-server test-unit test-build run nightwatch a11y

test-dev: verify test-unit-dev

deploy: assets
	node ./_deploy/compile-layouts
	node ./_deploy/s3.js
	$(MAKE) npm-publish
	sleep 20
	nht rebuild --all --serves user-page

serve:
	@echo '`make serve` is no longer needed to bower link.'
	@echo 'Instead set the environment variable `NEXT_APP_SHELL=local` in your app'
	@echo 'and run `make build run` etc in the app'
	exit 2
