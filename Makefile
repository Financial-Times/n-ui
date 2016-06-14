include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

pre-package:
	bower install n-ui --config.registry.search=http://registry.origami.ft.com --config.registry.search=https://bower.herokuapp.com

deploy:
	node ./_deploy/s3.js

dist: pre-package assets-production deploy

test: verify test-unit dist

test-dev: verify test-unit-dev
