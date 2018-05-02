node_modules/@financial-times/n-gage/index.mk:
	npm install --no-save @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

.PHONY: build

# n-ui has an unconventional a11y recipe
# so we ignore checking `make a11y` exists as part of provision
# Pa11y will still run locally and in CI
IGNORE_A11Y = true

#
# Development tasks
#

run: build-css-loader
ifneq ($(CIRCLECI),)
	export NEXT_APP_SHELL=local; export FT_GRAPHITE_KEY=dummy; node demo/app
else
	export NEXT_APP_SHELL=local; export FT_GRAPHITE_KEY=dummy; nodemon demo/app
endif

demo: run

build:
	concurrently --kill-others-on-fail \
		"webpack --config demo/webpack.config.js" \
		"./scripts/build-sass.sh demo/client/main.scss"

watch:
	concurrently --kill-others-on-fail \
		"webpack --config demo/webpack.config.js  --watch" \
		"watch-run -ip 'main.scss,demo/client/**/*.scss' ./scripts/build-sass.sh demo/client/main.scss"

# test-browser-dev is only for development environments.
test-browser-dev:
	$(info *)
	$(info * Developers note: This test will never "complete". It's meant to run in a separate tab. It'll automatically rerun tests whenever one of your files changes.)
	$(info *)
	karma start karma.conf.js --single-run false --auto-watch true

# Test-dev is only for development environments.
test-dev: verify test-server test-browser-dev

test-server: export NODE_ENV=production
test-server: export HOSTEDGRAPHITE_APIKEY=dummykey
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
	mocha --exit --file server/test/setup.js server/test/*.test.js server/test/**/*.test.js

test-server-coverage: ## test-server-coverage: Run the unit tests with code coverage enabled.
	nyc mocha --file server/test/setup.js --reporter=$(if $(CIRCLECI),lcovonly,lcov) server/test/*.test.js server/test/**/*.test.js --exit


#
# Utilities
#

# compiles the human readable css loader code to the minified one that gets inlined in the page
build-css-loader:
	uglifyjs browser/layout/src/css-loader.js -o browser/layout/partials/css-loader.html

# HACK: in order to run the server tests the stylesheet loader partial needs copying into the test app... don't ask
copy-stylesheet-partial:
	cp browser/layout/partials/stylesheets.html server/test/fixtures/app/views/partials

developer-note:
ifeq ($(NODE_ENV),) # Not production
ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
	$(info *)
	$(info * Developers note: `make test` is meant for CircleCI, not development. Instead, you should `make test-dev`.)
	$(info *)
endif
endif


#
# CI TASKS
#

test-browser:
	karma start karma.conf.js

test-build: build

smoke:
ifeq ($(CIRCLE_BUILD_NUM),) # not CircleCI
	n-test smoke -H http://local.ft.com:5005 -c browser/test/smoke.js
else
	n-test smoke -H https://ft-next-test-artefacts.s3-eu-west-1.amazonaws.com/n-ui/test-page/$(CIRCLE_BUILD_NUM) -c browser/test/smoke.js
endif

pally-conf:
	node .pa11yci.js

a11y: test-build pally-conf
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	PA11Y=true make run


# Note: `run` executes `node demo/app`, which fires up express, then deploys
# a test static site to s3, then exits, freeing the process to execute `smoke a11y`.
test:
	make developer-note verify pally-conf test-server test-browser test-build run smoke a11y build-dist
	bundlesize

build-production: build-bundle

build-bundle:
	concurrently --kill-others-on-fail \
		"webpack -p --bail --config build/deploy/webpack.deploy.config.js" \
		"./scripts/build-sass.sh browser/bundles/main.scss public/n-ui/n-ui-core.css"

build-dist: build-bundle build-css-loader
	node ./build/deploy/build-auxilliary-files.js

deploy-s3:
	# deploy to hashed urls on s3
	nht deploy-hashed-assets --directory public/n-ui --monitor-assets

deploy: deploy-s3 npm-publish rebuild-user-facing-apps

rebuild-user-facing-apps:
# Don't rebuild apps if a beta tag release
ifneq (,$(findstring beta,$(CIRCLE_TAG)))
	echo "This looks like a beta release so I won't rebuild any apps";
else
	# only autodeploy all apps in office hours
	HOUR=$$(date +%H); DAY=$$(date +%u); if [ $$HOUR -ge 8 ] && [ $$HOUR -lt 16 ] && [ $$DAY -ge 0 ] && [ $$DAY -lt 6 ]; then \
	echo "REBUILDING ALL APPS" && nht rebuild --all --serves user-page; fi
endif
