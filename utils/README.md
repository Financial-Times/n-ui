# Util

CSS and JS utilities for next

## Usage

### CSS

This module is bundled by default.

#### Layout

##### `.n-util-clearfix`
_The_ [micro clearfix](http://nicolasgallagher.com/micro-clearfix-hack/).

#### Display

##### `.n-util-hide`
Hide an element.

##### `.n-util-hide@screen`
Hide an element for screens.

##### `.n-util-hide@print`
Hide an element for print.

##### `.n-util-visually-hidden`
Hide an element but ensure it is still accessible by assistive devices.

#### Text

##### `.n-utils-text-center`
Center align text.

##### `.n-utils-text-left`
Left align text.

##### `.n-utils-text-right`
Right align text.

##### `.n-utils-truncate`
Truncate text to a single line.

### JS

This module is bundled by default.

#### `$(sel, [ctx])`
Equivalent to `ctx.querySelector(sel)` (`ctx` defaults to `document`)

#### `$$(sel, [ctx])`
Equivalent to `Array.from(ctx.querySelectorAll(sel))` (`ctx` defaults to `document`)
