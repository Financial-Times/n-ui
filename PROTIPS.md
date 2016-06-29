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
@include @include nGetImage('logo', 'brand-fastft', null, 60, 17);
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
Use `make demo` to run a demo application which delivers the app defined in `/_demo`. Feel free to edit and commit anything in there as it's for dev use only; just be sure to leave it in a runnable condition.
- - -
To output critical path css you need 3 things: `hasHeadCss: true` in your n-express options, `withHeadCss: true` in your n-webpack options and `$output-critical: true` in your sass
