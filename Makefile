include n.Makefile

.PHONY: dist

test: test-unit verify dist

test-unit:
	karma start karma.conf.js

test-dev:
	karma start karma.conf.js --single-run false --auto-watch true

pre-package:
	bower install n-ui#rhys/better-globalling --config.registry.search=http://registry.origami.ft.com --config.registry.search=https://bower.herokuapp.com

deploy:
	node ./_deploy/s3.js

dist: pre-package assets deploy


