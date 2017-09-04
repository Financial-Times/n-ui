# n-ui [![Coverage Status](https://coveralls.io/repos/github/Financial-Times/n-ui/badge.svg)](https://coveralls.io/github/Financial-Times/n-ui)

Server, build and client side bootstrapping for next's user-facing applications.

## Quickstart

n-ui has three parts - a server, a client side 'app shell' (js, css & handlebars layout), and a build. **Expect things to break if you don't use all 3.**

### Server

n-ui is a wrapper around n-express which adds templating and asset loading features

`npm install @financial-times/n-ui`

```
const app = require('@financial-times/n-ui')(opts)

```

Where opts is an object supporting all `n-express`'s options, but with many set to `true` by default (see `/server/index.js` for details). Additioanl options include

- `partialsDirectory` String or array - path[s] to load partials from, this in addition to the standard `views/partials` that is set for every app
- `layoutsDir` String - a path to load handlebars views from defults to `node_modules/@financial-times/n-ui/layout`
- `withJsonLd` Boolean - output jsonLD schema information in the page head

### Build
n-ui comes bundled with its own build tool - basically `webpack`, `haikro build` and a little bit of other stuff. To use it, add the following to your Makefile:

```Makefile
build:
	nui build

build-production:
	nui build --production

watch:
	nui watch
```

To define entry points for your assets use a `n-ui-build.config.js` file in the root of your project, which can export any object compatible with n-webpack


### JS

#### Config
This should live in a `/client/n-ui-config.js` file

```javascript
module.exports = {
	preset: 'complete', // 'discrete' will turn off ads & various popups
	features: {
		lazyLoadImages: true // turns individual features on/off. Check `/browser/bootstrap/js/component-initializer.js` for an upto date feature list
	}
}
```

#### App bootstrapping

n-ui takes care of loading polyfills etc, and your application code shoudl be wrapped in the bootstrap method

e.g.

```javascript
import { bootstrap } from 'n-ui';

bootstrap(({ flags , appInfo, allStylesLoaded }) => {
    if (flags.get('feature')) {
        component.init();
    }

    allStylesLoaded
	    .then(() => {
	        lazyComponent.init();
	    });
});
```

### Sass
Nothing fancy going on here any more 😄. No mixins (though the n-ui-foundations module has a few you will want to use), no tricky critical path css stuff.

```sass
@import "n-ui/main"
```
This will, when using the n-ui build tool, split n-ui's styles into head-n-ui-core.css and n-ui-core.css files, and the server will inline/linnk to these appropriately.


### Local development

#### Working in n-ui
You should be able to work in n-ui as if it's an app - `make watch` and `make run` should work and serve a demo app on `local.ft.com:5005`

#### Testing in an app
`export NEXT_APP_SHELL=local` then use all your usual make tasks. Your app will build and serve n-ui from your locally installed bower components. You can do this whether you're bower/npm linking n-ui or not


### Releasing n-ui

When you release an n-ui tag 3 things happen

- assets are built and deployed to s3, from where they are linked to/downloaded by apps
- the npm package is published
- during work hours (9am to 4pm), all user-facing apps are rebuilt to pick up the changes

## APIs

### Linked Resources (preload) `res.linkResource(url, meta, options)`
Adds link headers to optimise requests for assets, defaulting to preload behaviour
- `url` - absolute or relative path to the resource
- `meta` - object defining additional properties to add to the header
	- `rel` [default: 'preload'] - value of the `rel` property
	- `as` - value of the `as` property e.g. 'stylesheet'
- `options` - additional options when creating the header
	- `priority` - a value of highest will add the link header _before_ all previously added resources that do not specify this (shodul not normally used by apps - used internally to ensure n-ui's resources are always loaded as wuickly as possible)
	- `hashed` - if true the path to the asset will be resolved to the equivalent hashed aset path


# Anything below here isn't necessarily 100% up to date - n-ui has changed a lot recently and updating the docs is ongoing



### Dev workflow

[Overview of how the n-ui js bundle is delivered](https://docs.google.com/presentation/d/1UyeVsxE8GqGe-jVZDB5ppMLeRk2Ad49OuBBO8xDvyxs/edit#slide=id.p)

#### Standalone development

* `make build run` will
	- start a server on `localhost:5005` which serves a demo page of most of the core n-ui components. *Note: Any changes to templates require restarting the server*
	- build an n-ui bundle that will bootstrap the js and css for the page
* `make test-unit-dev` will run unit tests in Chrome using karma. To add tests for a new subcomponents, or to only run tests for a single subcomponent, modify the `componentsToTest` list in karma.config.js. In CI these tests are run in more browsers using saucelabs

#### Bower linking

To work with n-ui when it's bower linked into an app you will need to `export NEXT_APP_SHELL=local` in your app and then proceed exactly as you would for any other component

## A11y testing

We hope to be able to a11y test all components before they are used in an app and end up causing lots of applications to fail builds. For now we are testing components in CI using pa11y and this requires some additional set up when creating a new component. Any directory in the root is considered to be a component and will require this additional set up.

* Inside a component directory there must be a `pa11y-config.js` that must return JSON
* The must have an `entry` property and and may contain a `data` property if required
	* The `entry` value should point to the main template for the component without any file extension and relative to the component root.
	* The `data` can be used if you need to pass any fixture data to the component for testing.


## Adding subcomponents

**Don't** - n-ui is no longer a place to dump all next components. If you need to create a new shared component create a new repo for it and use the `n-ui-foundations` component to access primitive styles as used in next.

## JS usage

### Opting out of using a component provided by n-ui

If, for example, you want to use a beta of an origami component in a single app, or use React instead of preact
In your app’s webpack.config.js, you can pass an `nUiExcludes` array as an option to nWebpack e.g. `nUiExcludes: [‘React’, ‘React-Dom’]`



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
