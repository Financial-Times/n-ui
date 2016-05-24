.PHONY: test

clean:
	git clean -fxd

install:
	obt install --verbose
	bower install --config.registry.search=http://registry.origami.ft.com --config.registry.search=https://bower.herokuapp.com

verify:
	nbt verify  --skip-layout-checks

unit-test:
	karma start test/karma.conf.js

test: unit-test verify e2e-prompt

e2e-prompt:
	@echo '**********************************'; \
	echo '**********************************'; \
	echo '**********************************'; \
	echo ''; \
	echo 'Be sure to visit http://bit.ly/next-acid in a variety of browsers'; \
	echo 'to verify everything works cross browser.'; \
	echo 'If you've made any changes make sure they're reflected in test/e2e and run make deploy'; \
	echo ''; \
	echo '**********************************'; \
	echo '**********************************'; \
	echo '**********************************';

build:
	rm -Rf test/e2e/build
	mkdir test/e2e/build
	node test/e2e/build-acid-test
	browserify -t [ babelify --presets [ es2015 ] --plugins [ transform-es2015-modules-commonjs ] ] -t debowerify test/e2e/main.js > test/e2e/build/bundle.js
	echo '/* eslint-disable */' | cat - test/e2e/build/bundle.js > temp && mv temp test/e2e/build/bundle.js
	echo '/* eslint-enable */' >> test/e2e/build/bundle.js

run:
	http-server test/e2e/build -p 3002

deploy: build
	git add -A test/e2e/build
	git commit -m 'commiting new acid test page'
	git subtree push --prefix test/e2e/build origin gh-pages

redeploy:
	git push origin :gh-pages
	git subtree push --prefix test/e2e/build origin gh-pages
