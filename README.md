# n-ui

# **An important note on releases **

n-ui is packaged indepenedntly and served on a url shared between apps. To keep our cache hit rate high for this url please observe the following conventions

- major releases - same as semver
- minor releases - reserve these for when you are adding a feature that needs the js to be updated at the same time as the templates
- patch releases - all other releases, including some which might normally be considered minor e.g. adding a sass mixin, adding a js method

If you forget to do the above and jsut stick to semver nothing will break, but it will mean our cache gets diluted

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

## API

### Replacing next-sass-setup in components

`@import "n-ui/env";`

### Bootstrapping your app

Sass and JS follow similar apis. Both expect a map of feature names (see main.js or configure.scss for feature lists), and also recognise 2 presets:

- `complete`: all the bits and pieces you need to style and add interactivity to a typical page on next, complete with MyFT, alerts, promos, ads, tracking etc.
- `discrete`: provides styles and scripts for just the header, footer and essential pieces of functionality such as tracking. For use on pages where we want no distractions E.G. errors, login and other forms.

Features may also be enabled and disabled individually.

```js
import { configure, bootstrap } from 'n-ui';

configure({
	preset: 'discrete',
	welcomeMessage: true
});

bootstrap(({ flags , mainCss, appInfo}) => {
	if (flags.get('feature')) {
		component.init();
	}

	mainCss.then(() => {
		lazyComponent.init();
	});
});
```

```scss
@import 'n-ui/configure';

@include nUiConfigure((
	'preset': 'discrete',
	'welcomeMessage': true
));

// Output a comment listing all n-ui features
@include nUiConfigureDebug();

@import 'n-ui/bootstrap';
```
