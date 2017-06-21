include n.Makefile

.PHONY: build

# n-ui has an unconventional a11y recipe
# so we ignore checking `make a11y` exists as part of provision
# Pa11y will still run locally and in CI
IGNORE_A11Y = true

demo: run

run: build-css-loader
ifneq ($(CIRCLECI),)
	export FT_GRAPHITE_KEY=dummy; node demo/app
else
	export FT_GRAPHITE_KEY=dummy; nodemon demo/app
endif

build:
	webpack --config demo/webpack.config.js --dev

build-production:
	build-bundle

watch:
	webpack --config demo/webpack.config.js --dev --watch

test-browser:
	karma start karma.conf.js

test-webpack:
	mocha test/webpack.spec.js

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
test-server: export FT_GRAPHITE_KEY=test-graphite-key
test-server: copy-stylesheet-partial
ifneq ($(CIRCLECI),)
ifeq ($(CIRCLE_TAG),)
	make test-server-coverage && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
else
	make test-server-plain
endif
else
	make test-server-plain
endif

test-server-plain:
	mocha server/test/*.test.js server/test/**/*.test.js

copy-stylesheet-partial:
	cp browser/layout/partials/stylesheets.html server/test/fixtures/app/views/partials

build-css-loader:
	uglifyjs browser/layout/src/css-loader.js -o browser/layout/partials/css-loader.html

build-bundle:
	webpack --bail --config build/deploy/webpack.config.js

deploy-s3:
	node ./build/deploy/s3.js

rebuild-user-facing-apps:
# Don't rebuild apps if a beta tag release
ifneq (,$(findstring 'beta',$(CIRCLE_TAG)))
	# only autodeploy all apps in office hours
	HOUR=$$(date +%H); DAY=$$(date +%u); if [ $$HOUR -ge 8 ] && [ $$HOUR -lt 16 ] && [ $$DAY -ge 0 ] && [ $$DAY -lt 6 ]; then \
	echo "REBUILDING ALL APPS" && sleep 20 && nht rebuild --all --serves user-page; fi
else
	echo "This looks like a beta release so I won't rebuild any apps";
endif

test-server-coverage: ## test-server-coverage: Run the unit tests with code coverage enabled.
	istanbul cover node_modules/.bin/_mocha --report=$(if $(CIRCLECI),lcovonly,lcov) server/test/*.test.js server/test/**/*.test.js

nightwatch:
	nht nightwatch browser/test/js-success.nightwatch.js

pally-conf:
	node .pa11yci.js

a11y: test-build pally-conf
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	PA11Y=true node demo/app

# Note: `run` executes `node demo/app`, which fires up express, then deploys
# a test static site to s3, then exits, freeing the process to execute `nightwatch a11y`.
test: developer-note verify pally-conf test-server test-browser test-build test-webpack run nightwatch a11y

developer-note:
ifeq ($(NODE_ENV),) # Not production
ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
	$(info *)
	$(info * Developers note: `make test` is meant for CircleCI, not development. Instead, you should `make test-dev`.)
	$(info *)
endif
endif

# Test-dev is only for development environments.
test-dev: verify test-browser-dev test-webpack

deploy: build-bundle deploy-s3 build-css-loader npm-publish rebuild-user-facing-apps
