include n.Makefile

test: test-unit verify

test-unit:
	karma start karma.conf.js
