CURRENT_BRANCH:=$(shell git rev-parse --abbrev-ref HEAD)

build-demos:
	node-sass --include-path bower_components demos/main.scss demos/build/main.css
	webpack

publish-demos: build-demos
	@git checkout gh-pages
	@git add -f index.html demos/build/
	@(git commit -m "Updating docs" && git push) || [ $$? -eq 1 ]
	@git checkout ${CURRENT_BRANCH)}
