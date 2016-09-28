# Header

This is the next implementation of [o-header](https://github.com/Financial-Times/o-header).

Data for the primary navigation, mega menus and drawer is provided by the [n-express](https://github.com/Financial-Times/n-express) navigation middleware.

Subnavigation may be implemented by the consuming application using the following structure:

```js
res.locals.subnav = {
    breadcrumb: [ ...ancestors, currentPage ],
    subsections: [ ...links ]
};
```

Optional locals can be set to change the display of the header

```
nUi: {
    header: {
        disableSticky: false, // turns off the sticky header
        userNav: false, // turns off the log-in/log-out/subscribe/etc links in the nav and drawer
        variant: 'logo-only' // currently the only variant, only displays the Financial Times logo in the header
    }
}
