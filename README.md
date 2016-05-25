# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

## API

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



