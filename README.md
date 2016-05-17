# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

## API

### Bootstrapping your app

Sass and JS follow similar apis. Both expect a map of feature names (see main.js or configure.scss for feature lists), and also recognise 2 presets:

- `complete`: all the bits and pieces you need to style and add interactivity to a typical page on next, complete with MyFT, alerts, promos, ads, tracking etc.
- `discrete`: provides styles and scripts for just the header, footer and essential pieces of functionality such as tracking. For use on pages where we want no distractions E.G. errors, login and other forms.

Examples:

```Javascript
import { bootstrap } from n-ui;

bootstrap({
	preset: 'discrete',
	welcomeMessage: true
}, ({flags}) => {
	if (flags.get('konami')) {
		easterEgg.init();
	}
})
```

```Sass
@import 'n-ui/configure';
@include nUiConfigure((
	preset: discrete,
	welcomeMessage: true
));
@import 'n-ui/bootstrap';
```



