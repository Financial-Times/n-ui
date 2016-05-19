# grid

This is more or less just the [origami o-grid component](http://registry.origami.ft.com/components/o-grid) with a few modifications

## IE8

No IE8 styles are output by default. To output an IE8 stylesheet the following pattern should work when using n-makefile

```scss
// main-ie8.scss

$o-grid-mode: 'fixed';
$o-grid-fixed-layout: 'M';

@import 'main';
```

## Offset columns

`offset` `pull` and `push` column selectors are disabled. To use these a mixin is provided `nUiGridOffset($layout: null, $amount: 1, $mode: offset)`

e.g.  `@include nUiGridOffset(M, 3, pull)`

## Human readable selectors

Pending a pull request to o-grid, these will be disabled, so use the numeric selectors i.e. `data-o-grid-colspan="6"` not `data-o-grid-colspan="half"`. The one exception is the `hide` keyword
