include n.Makefile

.PHONY: dist

test-unit:
	karma start karma.conf.js

test-unit-dev:
	karma start karma.conf.js --single-run false --auto-watch true

test-build:
	webpack --config webpack.config.test.js

test-server:
	rm -rf bower_components/n-ui
	mkdir bower_components/n-ui
	cp -rf $(shell cat _test-server/template-copy-list.txt) bower_components/n-ui
	node _test-server/app

deploy: assets
	node ./_deploy/s3.js
	$(MAKE) npm-publish

test: verify test-unit test-build test-server

test-dev: verify test-unit-dev

MSG_N_UI_CERT = "Please copy key.pem and key-cert.pem from next-router into this directory to start the server on https"
run:
	@if [ ! -f key.pem ]; then (echo $(MSG_N_UI_CERT) && exit 1); fi
	@if [ ! -f key-cert.pem ]; then (echo $(MSG_N_UI_CERT) && exit 1); fi
	http-server dist -p 3456 -c-1 --ssl --cert ./key-cert.pem --key ./key.pem
