# n-ui features

## SASS
- imports n-ui-foundations in non-silent mode for all the mixins it provides, and to output grid, normalize etc (see n-ui-foundations)
- outputs css for all the 'app shell' features (header + footer mainly)
- puts all the critical bits of this css in head-n-ui-core.css. Leaves the rest in main.css (or whatever the entrypoint defined in the webpack config is)

## JS
- builds separate bundles for o-errors and font-loader, which are pretty self-contained and can be cached independently
- main js file imports a few shared dependencies (o-date, ftdomdelegate...) and exposes these on window.ftNextUi so they can be used as webpack externals by teh js files built in apps
- initialises all the shared components (header, footer, ads, tracking etc.) based on what n-ui finds configured in the n-ui.config.js file in an app

## 'App' (Server + templating)
These are heavily interdependent - most of the complexity is in deciding which assets are needed (server) and how to load them (client/templating). Both are used in the demo and when running another app that uses n-ui (the demo is now very similar to a normal app, just a few tweaks to file paths)

### Server side
- Wraps n-express, turning on lots of features (backend key, flags) taht all user-facing apps should have
- Adds a few data models - navigation, anon, jsonLd
- Adds ability to serve static assets (only needed in local dev)
- Adds n-handlebars
- Adds logic to choose which assets to serve, from which urls
	- Prevents the app starting if expecte assets (defined in .gitignore) aren't present
	- Reads the contents of each stylesheet so it can be inlined if necessary (this also watches for changes in local dev)
	- decides whether to serve n-ui assets from the network or, if configured to use local app shell, locally
	- sets up a helper to generate asset urls which is aware of the installed n-ui version, whether local app shell is turned on, whether local or production
	- adds middleware which, for requests serving `text/html`:
		- creates a helper which is able to create a link header to a resource, and exposes this for the app's controllers to use. Things can be added as high priority or normal priority
		- registers a polyfill.io url, hashed urls for all the n-ui javascripts and the app's main.js as scripts to be loaded by the client side and added as link headers
		- registers lists of inline, lazy and blocking stylesheets, defaulting to `['head-n-ui-core', 'head']` and `['main']`. These can be overwritten by the app, but 'head-n-ui-core' is always prepended. Similar to js, non-inline ones are added as link headers
		- adds a link header to the financial times masthead

### Client side
- Adds loads of classes and attributes to `<html>` including for font lazy-loading
- adds the stylesheets specified by the server. Inline ones are inlined, lazy loaded ones are loaded with preload attributes and an inline script polyfills the preload behaviour (native in chrome). When all lazy loaded scripts are done, an event is fired to notify other scripts.
- Does a quick font-switch if detects fonts are already in cache
- Runs our cut the mustard check
- If cut the mustard check succeeds, load all the scripts with `async=false` so they execute in order
- If cut the mustard fails, or noscript, load picturefill polyfill and do some basic o-tracking stuff

## Demo
- This is really just an app with a few changes to paths, and a handful of hacks to tweak the urls pointed to for assets, and the build is run in app shell mode
- When running in CI, after it's started it pings itself to generate some test pages, which it pushes up to S3 so that saucelabs can use them

## N-ui build and deploy
- Starts as quite an ordinary webpack build
- Also builds 'auxilliary files', e.g. brotli-compressed versions, asset-hashes.json
- All these files are deployed to the n-ui s3 bucket, and are available at either n-ui.ft.com, or ft.com/__assets/n-ui (TODO - if we bundle asset-hashes.json and built files in with the npm module we won't need this step any more)
- These files are also deployed to the hashed assets s3 bucket, and are thus avilable at ft.com/__assets/hashed/n-ui/
- Once the files are verified to have gone to s3 ok (built into `nht`) the component is published to npm and all user-facing apps are rebuilt without cache

## App build & run

### Without app shell (normal)
- Downloads asset-hashes.json from n-ui (saves as n-ui-hashed-assets.json) and n-ui-head-core.css (see above - these can just be bundled in the npm package)
- JS - Uses the list of externals supplied by n-ui in the webpack config so e.g. `require('o-date')` gets replaced by `window.ftNextUi.__oDate` - smaller bundle size as a result
- Sass - Builds all styles, including n-ui ones, so generates n-ui-head-core.css, and the rest of n-ui styles are included in its own main.css (TODO - this is _almost_ redundant - hopefully move to not building all n-ui soon)
- When running all n-ui stuff (aside from inlined head.css) are linked to from the network

### With app shell (dev build)
Same as above except
 - Additional entry points for all n-ui JS files added to webpack config
 - paths are adjusted so these locally built assets are used in the page
