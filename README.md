# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

This project consists of many modules. They include the primitive building blocks used by the majority of Next applications, constitute the basic look and feel of a page and integrate with upstream Origami modules for consistency across FT digital products.

### Dev workflow

[Overview of how the n-ui js bundle is delivered](https://docs.google.com/presentation/d/1UyeVsxE8GqGe-jVZDB5ppMLeRk2Ad49OuBBO8xDvyxs/edit#slide=id.p)

#### Standalone development

* `make build run` or `make watch run` will
	- start a server on `localhost:5005` which serves a demo page of most of the core n-ui components *Note: Any changes to templates require restarting the server*
	- build an n-ui bundle that will bootstrap the js and css for the page
* `make test-unit-dev` will run unit tests in Chrome using karma. To add tests for a new subcomponents, or to only run tests for a single subcomponent, modify the `componentsToTest` list in karma.config.js. In CI these tests are run in more browsers using saucelabs

#### Bower linking

To work with n-ui when it's bower linked into an app you will need to `export NEXT_APP_SHELL=local" in your app and then proceed exactly as you would for any other component

## A11y testing

We hope to be able to a11y test all components before they are used in an app and end up causing lots of applications to fail builds. For now we are testing components in CI using pa11y and this requires some additional set up when creating a new component. Any directory in the root is considered to be a component and will require this additional set up.

* Inside a component directory there must be a `pa11y-config.js` that must return JSON
* The must have an `entry` property and and may contain a `data` property if required
	* The `entry` value should point to the main template for the component without any file extension and relative to the component root.
	* The `data` can be used if you need to pass any fixture data to the component for testing.


## Releasing n-ui
When you release an n-ui tag 2 things happen
-serves user-page` from within an app to trigger a rebuild of all user facing apps
- After a successful build the javascript will be bundled and pushed out to S3. The Fastly cache of this file will be purged immediately, but users may have the last version cached in their browser for up to 20 minutes. For this reason, it's best to observe the following:
	- if there are style + template changes in your release, wait 20 minutes before triggering a rebuild of all apps
	- be defensive and rigorous in coding your core experience - in the relatively unlikely event that an app rebuilds with the style + template changes before your js changes have deployed, the experience will not appear broken to the user _if_ you either hide the component or provide a good core experience whne the js to handle it isn't present

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

## Server

n-ui is a wrapper around n-express which adds templating and asset loading features

`npm install @financial-times/n-ui`

```
const app = require('@financial-times/n-ui')(opts)

```

Where opts is an object supporting all `n-express`'s options and the following, which all default to `true` unless specified otherwise. In additions `withFlags` is set to `true` by default here (in n-express it is `false` by default)

- `withHandlebars` - adds handlebars as the rendering engine
- `withAssets` - adds asset handling middleware, see [Linked Resources (preload)](#linked-resources-preload). Ignored if `withHandlebars` is not `true`
- `withNavigation` - adds a data model for the navigation to each request (see below)
- `withNavigationHierarchy` - adds additional data to the navigation model concerning the current page's ancestors and children
- `withAnonMiddleware` - sets the user's signed in state in the data model, and varies the response accordingly
- `withHeadCss` - if the app outputs a `head.css` file, read it (assumes it's in the `public` dir) and store in the `res.locals.headCss`
- `partialsDirectory` String - a path to load partials from, this in addition to the standard `views/partials` that is set for every app
- `layoutsDir` String - a path to load handlebars views from defults to `node_modules/@financial-times/n-ui/layout`

### Linked Resources (preload)
Adds link headers to enable service workers to optimise requests for assets, defaulting to preload behaviour
e.g:
- res.linkResource('//path/to/file.css', {as: 'style'}) => adds a link header to `//path/to/file.css` with `as="style"` and `rel="preload"`
- res.linkResource('//path/to/file.js', {rel: 'prefetch', as: 'script'}) => adds a link header to `//path/to/file.js` with `as="script"` and `rel="prefetch"`
- res.linkResource('main.css', {as: 'style'}, {hashed: true}) => adds a link header to the hashed asset path generated for the app's `main.css` file

Link headers for `main.css` and `main.js` are added by default to any `text/html` request.

e.g `res.linkResource('comments.css', {as: 'style', rel: 'prefetch'})`


### Navigation
If you pass `withNavigation:true` in the init options, you will have navigation data available in `res.locals.navigation`.  this data comes from polling the [navigation API](https://github.com/Financial-Times/next-navigation-api).  This data is used to populate the various menus and navigation items on the apps.  The following data is available

	res.locals.navigation = {
		lists: {
			navbar_desktop: // data for the main nav in the header (only on large screens)
 			navbar_mobile: //data for the white strip that appears on the homepage and fastFT pages only on small screens
			drawer: //data for the slide-out menu
			footer: // data for the footer
		}
	}

### Navigation Hierarchy
If you also pass `withNavigationHierarchy: true` in the init options you get some additonal properties detailing the current page's position in the hierarchy.  This is only currently useful on stream pages.  The following properties are added:

 	res.locals.navigation.currentItem // the current item
 	res.locals.navigation.children //an array of the direct decendents of the current page
 	res.locals.navigation.ancestors // an array of the parent items of the current page (top level first)

### Editions
The navigation model also controls the edition switching logic.  The following properties are added

	res.locals.editions.current // the currently selected edition
	res.locals.editions.others //  and array of other possible editions

### Other enhancements
- Our [Handlebars](http://handlebarsjs.com/) engine loads partials from `bower_components` and has a number of [additional helpers](https://github.com/Financial-Times/n-handlebars). It also points to [n-layout](https://github.com/Financial-Times/n-layout) to provide a vanilla and 'wrapper' layout
- Exposes everything in the app's `./public` folder via `./{{name-of-app}}` (only in non-production environments, please use [next-assets](https://github.com/Financial-Times/next-assets) or hashed-assets in production)

## Webpack

//TODO n-ui will expose a slightly preconfigured n-webpack
