# next-js-setup [![Circle CI](https://circleci.com/gh/Financial-Times/next-js-setup/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-js-setup/tree/master)

Set up of shared js dependencies

 - polyfills, including fetch
 - o-errors
 - feature flags
 - o-tracking and n-instrumentation
 - o-ads and other n-third-party-code

## Initialisation

2 methods of initialisation are available

### Bootstrap

This module contains code to run the standard next cut the mustard test, polyfill missing features and run your application code. In most cases thuis is the preferred method for initialising your client side javascript.

#### javascript

```js
require('next-js-setup').bootstrap(callback, options);
```

Where callback is a function that starts your app and will be passed the result of `init()` (see below) as its first parameter. If callback returns a promise all post init actions (e.g. loading adverts and tracking) will be deferred until that promise resolves (useful for applications which contain a significant amount of asynchronous initialisation)

#### html

Include `{{>next-js-setup/templates/ctm}}` in the `<head>` and `{{>next-js-setup/templates/script-loader}}` just before the closing `</body>` tag


### init

`init()` returns a promise for:

```javascript
{
	flags: // the [feature flags model](https://github.com/Financial-Times/next-feature-flags-client) in use by the client side code
	mainCss: // a promise which resolves when all the css (critical path and other ) has been loaded. It shodul be safe to initialise any component once this has reolved
}
```
