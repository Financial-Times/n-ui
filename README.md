# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

This project consists of many modules. They include the primitive building blocks used by the majority of Next applications, constitute the basic look and feel of a page and integrate with upstream Origami modules for consistency across FT digital products.

## Usage

For usage information see [the wiki](https://github.com/Financial-Times/n-ui/wiki).

## Dev workflow

## Standalone development

* `make -j2 serve build-demo` will
	- start a server on `localhost:5005` which serves a demo page of most of the core n-ui components
	- build, and watch, an n-ui bundle that will bootstrap the js and css for the page
* `make test-unit-dev` will run unit tests in Chrome using karma. To add tests for a new subcomponents, or to only run tests for a single subcomponent, modify the `componentsToTest` list in karma.config.js. In CI these tests are run in more browsers using saucelabs

## Bower linking

To work with n-ui when it's bower linked into an app you will need to run `make -j2 build run`, which will start a https server on port `3456` and build and watch an n-ui bundle. Your app will need to be on `n-express@17.6.3` or later for this to work.


## **An important note on releases **

n-ui is packaged independently and served on a url shared between apps. To keep our cache hit rate high for this url please observe the following conventions

- major releases - same as semver
- minor releases - reserve these for when you are adding a feature that needs the js to be updated at the same time as the templates
- patch releases - all other releases, including some which might normally be considered minor e.g. adding a sass mixin, adding a js method

If you forget to do the above and just stick to semver nothing will break, but it will mean our cache gets diluted
