# n-ui
`require('n-ui/utils')` has lots of useful utilities - throttle, debounce, script loading, $ and $$ DOM querying shorthands, custom event dispatcher (broadcast)
- - -
o-grid's additional classes for shuffling columns are off by default. You can however output them where you need them using the `nUiGridOffset` mixin
e.g. responsively `nUiGridOffset(L, 2, offset)`, or fro all layouts `nUiGridOffset($columns: 2, $mode: push)`.
- - -
There are two ways to specify some styles should go in the critical path css
Either wrap a block of styles in the `@include nUiCritical()` mixin,
or prefix the block with `@include nUiCriticalStart` and follow with `@include nUiCriticalEnd` (useful when importing a sass partial within the block)
- - -
For brand images and logos (as opposed to icons) use the `nGetImage()` mixin. It can be used for any image in any image set supported by the origami image service e.g.
```
@include nGetImage('logo', 'brand-fastft', null, 60, 17);
```
- - -
To check all styles that should be critical are being included in the critical path css delete the `<link ... href="/appname/main.css">` tag from your page's html. Alternatively, set your network throttling to _Regular 3G_ or worse
- - -
Output additional content in the `<head>` of the document by using the _head_ block in handlebars
```
{{#defineBlock 'head'}}
<meta name="my-extra-thing" content="is very very important">
{{/outputBlock}}
```
- - -
callbacks passed to the bootstrap method are passed an object with 3 properties - the `flags` model, a `mainCss` promise (resolved once non-critcal-styles have loaded) and `appInfo`, an object containing basic information about the app
- - -
To output critical path css you need 3 things: `hasHeadCss: true` in your n-express options, `withHeadCss: true` in your n-webpack options and `$output-critical: true` in your sass
- - -
To test changes that affect the interaction of multiple bundles you can deploy a beta to next-geebeee just by creating a beta tag e.g. `v2.3.4-beta.1`. If you `bower install n-ui#2.3.4-beta.1` in your local app it should pick up your beta version
- - -
The webpack build for karma can be a bit flaky in node 4 (no idea why). Try upgrading to node 6 and reinstalling your node modules
- - -
To initialise your app's js superquick define an `n-ui-config.js` file in your `./client/` directory. This will be use inline to kick off initialisation instantly (you should still require it and pass in to `n-ui/bootstrap` in your app's js file though, as this is the fallback if the `nUiBundle` flag is off)
- - -
If you get lots of bower conflicts when installing, **always** cancel the build and try `rm -rf bower_components; bower install`. Bower often adds unnecessary resolutions when the install is not completely fresh
- - -
When working locally, if you don't want to load the n-ui bundle from the CDN turn the `nUiBundle` flag off
