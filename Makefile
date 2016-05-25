include n.Makefile

test: verify

test-layout:
	karma start layout/test/karma.conf.js
