# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

This project consists of many modules. They include the primitive building blocks used by the majority of Next applications, constitute the basic look and feel of a page and integrate with upstream Origami modules for consistency across FT digital products.

## Usage

For CSS usage information see [the wiki](https://github.com/Financial-Times/n-ui/wiki).

## Adding subcomponents

1.	Create a subdirectory for your component, add code, docs and tests
2.	For the js, make sure it’s referred to appropriately in `main.js`, `entry.js` and (if it’s part of the ‘app shell’) `js-setup/js/component-initializer.js`. If it has tests (which it should have) add the component’s name to the list at the top of `karma.conf.js`
3.	For css add to `configure.css` and `env.css` as appropriate
4.	Add use cases of the component to `_test/server/views/default.html` and `_test-server/template-copy-list.txt` as appropriate

## JS usage

### Opting out of using a component provided by n-ui

If, for example, you want to use a beta of an origami component in a single app, or use React instead of preact
In your app’s webpack.config.js, you can pass an `nUiExcludes` array as an option to nWebpack e.g. `nUiExcludes: [‘React’, ‘React-Dom’]`

### Dev workflow

[Overview of how the n-ui js bundle is delivered](https://docs.google.com/presentation/d/1UyeVsxE8GqGe-jVZDB5ppMLeRk2Ad49OuBBO8xDvyxs/edit#slide=id.p)

#### Standalone development

* `make -j2 serve build-demo` will
	- start a server on `localhost:5005` which serves a demo page of most of the core n-ui components *Note: Any changes to templates require restarting the server*
	- build, and watch, an n-ui bundle that will bootstrap the js and css for the page
* `make test-unit-dev` will run unit tests in Chrome using karma. To add tests for a new subcomponents, or to only run tests for a single subcomponent, modify the `componentsToTest` list in karma.config.js. In CI these tests are run in more browsers using saucelabs

#### Bower linking

To work with n-ui when it's bower linked into an app you will need to run `make -j2 watch run`, which will start a https server on port `3456` and build and watch an n-ui bundle. Your app will need to be on `n-express@17.6.3` or later for this to work.

*Note: If you want to bower link a dependency of n-ui into your app, you will have to bower link it to n-ui and then link n-ui to your app. Or you could try adding the component name to `nUiExcludes` passed in to webpack*
