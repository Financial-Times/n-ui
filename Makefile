include n.Makefile

.PHONY: build

demo: run

run: build-css-loader
ifneq ($(CIRCLECI),)
	node demo/app
else
	nodemon demo/app
endif

build:
	webpack --config demo/webpack.config.js --dev

watch:
	webpack --config demo/webpack.config.js --dev --watch

test-browser:
	karma start karma.conf.js

# test-browser-dev is only for development environments.
test-browser-dev:
	$(info *)
	$(info * Developers note: This test will never "complete". It's meant to run in a separate tab. It'll automatically rerun tests whenever one of your files changes.)
	$(info *)
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config demo/webpack.config.js

test-server: export FT_NEXT_BACKEND_KEY=test-backend-key
test-server: export FT_NEXT_BACKEND_KEY_OLD=test-backend-key-old
test-server: export FT_NEXT_BACKEND_KEY_OLDEST=test-backend-key-oldest
test-server: copy-stylesheet-partial
ifneq ($(CIRCLECI),)
	make coverage-report && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
else
	mocha server/test/*.test.js server/test/**/*.test.js
endif

copy-stylesheet-partial:
	cp browser/layout/partials/stylesheets.html server/test/fixtures/app/views/partials

build-css-loader:
	uglifyjs browser/layout/src/css-loader.js -o browser/layout/partials/css-loader.html

coverage-report: ## coverage-report: Run the unit tests with code coverage enabled.
	istanbul cover node_modules/.bin/_mocha --report=$(if $(CIRCLECI),lcovonly,lcov) server/test/*.test.js server/test/**/*.test.js

nightwatch:
	nht nightwatch test/js-success.nightwatch.js

pally-conf:
	node .pa11yci.js

a11y: test-build pally-conf
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	PA11Y=true node demo/app

# Note: `run` executes `node demo/app`, which fires up express, then deploys
# a test static site to s3, then exits, freeing the process to execute `nightwatch a11y`.
test: developer-note verify pally-conf test-server test-browser test-build run nightwatch a11y

developer-note:
ifeq ($(NODE_ENV),) # Not production
ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
	$(info *)
	$(info * Developers note: `make test` is meant for CircleCI, not development. Instead, you should `make test-dev`.)
	$(info *)
endif
endif

# Test-dev is only for development environments.
test-dev: verify test-browser-dev

deploy:
	webpack --bail --config build/deploy/webpack.config.js
	node ./build/deploy/s3.js
	$(MAKE) build-css-loader
	$(MAKE) npm-publish
	# only autodeploy all apps in office hours
	HOUR=$$(date +%H); DAY=$$(date +%u); if [ $$HOUR -ge 9 ] && [ $$HOUR -lt 17 ] && [ $$DAY -ge 0 ] && [ $$DAY -lt 6 ]; then \
	echo "REBUILDING ALL APPS" && sleep 20 && nht rebuild --all --serves user-page; fi
