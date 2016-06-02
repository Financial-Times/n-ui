include n.Makefile

test: test-unit verify

test-unit:
	karma start karma.conf.js

test-dev:
	karma start karma.conf.js --single-run false --auto-watch true
