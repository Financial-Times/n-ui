# n-ui

[![CircleCI](https://circleci.com/gh/Financial-Times/n-ui.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-ui) [![Coverage Status](https://coveralls.io/repos/github/Financial-Times/n-ui/badge.svg)](https://coveralls.io/github/Financial-Times/n-ui)

Server, build and client side bootstrapping for ft.com’s user-facing applications.

**PLEASE DON’T USE THIS OUTSIDE OF USER-FACING FT.COM APPLICATIONS. If you need a good Express server with Handlebars, metrics etc available consider using [n-internal-tool](https://github.com/Financial-Times/n-internal-tool), [n-express](https://github.com/Financial-Times/n-express) or copying what you need from n-ui**

## Quickstart

n-ui has three parts – a server, a client side “app shell” (JS, CSS & Handlebars layout), and a build. **Expect things to break if you don’t use all 3.**

### Server

n-ui is a wrapper around n-express which adds templating and asset-loading features.

`npm install @financial-times/n-ui`

```javascript
const app = require('@financial-times/n-ui')(opts);

app.locals.nUiConfig = {
	preset: 'complete', // 'discrete' will turn off ads & various popups
	features: {
		lazyLoadImages: true // turns individual features on/off. Check `/browser/bootstrap/js/component-initializer.js` for an up-to-date feature list
	}
};
```

Where opts is an object supporting all `n-express`’s options, but with many set to `true` by default (see `/server/index.js` for details). Additional options include:

- `partialsDirectory` String or array – path[s] to load partials from, this in addition to the standard `views/partials` that is set for every app
- `layoutsDir` String – a path to load Handlebars views from defults to `node_modules/@financial-times/n-ui/layout`
- `withJsonLd` Boolean – output jsonLD schema information in the page head

### Build
n-ui comes bundled with its own build tool – basically `webpack`, `haikro build` and a little bit of other stuff. To use it, add the following to your Makefile:

```Makefile
build:
	nui build

build-production:
	nui build --production

watch:
	nui watch
```

To define entry points for your assets, use a `n-ui-build.config.js` file in the root of your project, which can export any object compatible with webpack.


### JS

#### App bootstrapping

n-ui takes care of loading polyfills etc, in order. n-ui exports 4 things you’ll want to use:
- `flags` – the feature/development/maintenance/MVT flags object
- `appInfo` – metadata about the app that's serving the page
- `allStylesLoaded` – a promise that resolves once all the lazy-loaded styles are in place
- `onAppInitialized` [required] – a function to call once the app js has successfully executed. This tells integration tests when the page is “complete” among other things

`import` one or more of the above from n-ui in your application code, which no longer needs to be wrapped in a function.

e.g.

```javascript
import { flags , allStylesLoaded, onAppInitialized } from 'n-ui';

if (flags.get('feature')) {
	component.init();
}

allStylesLoaded
	.then(() => {
		lazyComponent.init();
		onAppInitialized(); // it’s up to you to define when your app is “ready”
	});
```

### Sass
Nothing fancy going on here anymore 😄. No mixins (though the n-ui-foundations module has a few you will want to use), no tricky critical path CSS stuff.

```sass
@import "n-ui/main";
```
This will, when using the n-ui build tool, split n-ui’s styles into head-n-ui-core.css and n-ui-core.css files, and the server will inline/link to these appropriately.

### Local development

#### Working in n-ui
You should be able to work in n-ui as if it’s an app – `make watch` and `make run` should work and serve a demo app on `local.ft.com:5005`.

#### Testing in an app
In local n-ui:
- `make install`
- `make build-css-loader`
- `npm link`
- `bower link`

In the app (e.g. next-article):
- `export NEXT_APP_SHELL=local`
- `bower link n-ui`
- `npm link @financial-times/n-ui`
- `make run`

### Releasing n-ui

When you release an n-ui tag, 3 things happen:

- assets are built and deployed to s3, from where they are linked to/downloaded by apps
- the npm package is published
- during work hours (9am to 4pm), all user-facing apps are rebuilt to pick up the changes

## Server side APIs

### Linked Resources (preload) `res.linkResource(url, meta, options)`
Adds link headers to optimise requests for assets, defaulting to preload behaviour:
- `url` – absolute or relative path to the resource
- `meta` – object defining additional properties to add to the header
	- `rel` [default: 'preload'] - value of the `rel` property
	- `as` – value of the `as` property e.g. 'stylesheet'
- `options` – additional options when creating the header
	- `priority` – a value of highest will add the link header _before_ all previously added resources that do not specify this (should not normally used by apps – used internally to ensure n-ui’s resources are always loaded as quickly as possible)
	- `hashed` – if true the path to the asset will be resolved to the equivalent hashed asset path

### Navigation
If you pass `withNavigation:true` in the init options, you will have navigation data available in `res.locals.navigation`. This data comes from polling the [navigation API](https://github.com/Financial-Times/next-navigation-api). This data is used to populate the various menus and navigation items on the apps. The following data is available:

```javascript
	res.locals.navigation = {
		lists: {
			navbar_desktop: // data for the main nav in the header (only on large screens)
			navbar_mobile: //data for the white strip that appears on the homepage and fastFT pages only on small screens
			drawer: //data for the slide-out menu
			footer: // data for the footer
		}
	};
```

#### Subnavigation

See the [MyFT page](https://www.ft.com/myft/following) for a rendered copy of this config.

```javascript
res.locals.navigation = {
    // other settings here...

    showSubNav: true,
    // this populates the breadcrumb section at the left of the subnav
    breadcrumb: [
        {
            id: 'my-ft',
            label: 'My FT',
            url: '/myft/following'
        }
    ],
    // this populates the current level of subnav
    subsections: [
        {
            id: 'feed',
            label: 'myFT Feed',
            url: '/myft/following'
        },
        {
            id: 'alerts',
            label: 'Emails & Alerts',
            url: '/myft/alerts'
        }
    ],
    // optionally, add a 'Sign out' link to the right of the subnav (default is off)
    showSignOut: true
}
```

#### Navigation Hierarchy
If you also pass `withNavigationHierarchy: true` in the init options you get some additonal properties detailing the current page’s position in the hierarchy. This is only currently useful on stream pages. The following properties are added:

```javascript
	res.locals.navigation.currentItem // the current item
	res.locals.navigation.children // an array of the direct descendant of the current page
	res.locals.navigation.ancestors // an array of the parent items of the current page (top-level first)
```

#### Editions
The navigation model also controls the edition switching logic. The following properties are added:

```javascript
	res.locals.editions.current // the currently selected edition
	res.locals.editions.others //  and array of other possible editions
```

#### Header with clickable logo
In same cases you might need to show only the FT logo in the header, and hide all other navigation. This pattern is used in several conversion apps.

```javascript
{
    nUi: {
        header: {
            variant: 'logo-only'
        }
    }
}
```

#### Header with not-clickable logo, and hide footer
If your page will be linked to from the iOS app, and no outbound navigation from it is allowed, then the flag 'hideOutboundLinks' will be set to true for you.
This will render the header logo without it being a link, and hide the page footer.

### Other enhancements
- Our [Handlebars](http://handlebarsjs.com/) engine loads partials from `bower_components` and has a number of [additional helpers](https://github.com/Financial-Times/n-handlebars). It also points to [n-layout](https://github.com/Financial-Times/n-layout) to provide a vanilla and “wrapper” layout
- Exposes everything in the app’s `./public` folder via `./{{name-of-app}}` (only in non-production environments, please use [next-assets](https://github.com/Financial-Times/next-assets) or hashed-assets in production)
