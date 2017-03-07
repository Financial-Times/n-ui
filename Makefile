include n.Makefile

demo: run

run:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

build:
	webpack --config _test-server/webpack.config.demo.js --dev

watch:
	webpack --config _test-server/webpack.config.demo.js --dev --watch

test-unit:
	karma start karma.conf.js

# test-unit-dev is only for development environments.
test-unit-dev:
	$(info *)
	$(info * Developers note: This test will never "complete". It's meant to run in a separate tab. It'll automatically rerun tests whenever one of your files changes.)
	$(info *)
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config _test-server/webpack.config.demo.js

test-server: export FT_NEXT_BACKEND_KEY=test-backend-key
test-server: export FT_NEXT_BACKEND_KEY_OLD=test-backend-key-old
test-server: export FT_NEXT_BACKEND_KEY_OLDEST=test-backend-key-oldest
test-server: copy-stylesheet-loader
	mocha server/test/*.test.js node/test/**/*.test.js

copy-stylesheet-loader:
	cp layout/partials/stylesheets.html server/test/fixtures/app/views/partials

coverage-report: ## coverage-report: Run the unit tests with code coverage enabled.
	istanbul cover node_modules/.bin/_mocha --report=$(if $(CIRCLECI),lcovonly,lcov) server/test/*.test.js server/test/**/*.test.js

nightwatch:
	nht nightwatch test/js-success.nightwatch.js

pally-conf:
	node .pa11yci.js

a11y: test-build pally-conf
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	PA11Y=true node _test-server/app

# Note: `run` executes `node _test-server/app`, which fires up exchange, then deploys
# a test static site to s3, then exits, freeing the process to execute `nightwatch a11y`.
test: developer-note verify pally-conf test-server test-unit test-build run nightwatch a11y

developer-note:
ifeq ($(NODE_ENV),) # Not production
ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
	$(info *)
	$(info * Developers note: `make test` is meant for CircleCI, not development. Instead, you should `make test-dev`.)
	$(info *)
endif
endif

# Test-dev is only for development environments.
test-dev: verify test-unit-dev

deploy: assets
	node ./_deploy/s3.js
	$(MAKE) npm-publish
	# only autodeploy all apps in office hours
	HOUR=$$(date +%H); DAY=$$(date +%u); if [ $$HOUR -ge 9 ] && [ $$HOUR -lt 17 ] && [ $$DAY -ge 0 ] && [ $$DAY -lt 6 ]; then \
	echo "REBUILDING ALL APPS" && sleep 20 && nht rebuild --all --serves user-page; fi

serve:
	@echo '`make serve` is no longer needed to bower link.'
	@echo 'Instead set the environment variable `NEXT_APP_SHELL=local` in your app'
	@echo 'and run `make build run` etc in the app'
	exit 2
