# Utils

CSS and JS utilities for next

## Usage

### Sass

This module is bundled by default and cannot be configured.

### HTML

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

##### `.n-util-hide-enhanced`
Hide an element in the enhanced experience

##### `.n-util-hide-core`
Hide an element in the core experience

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

This module is bundled not bundled by default.

```js
const utils = require('n-ui/utils');
```

#### `$(sel, [context])`
Equivalent to `context.querySelector(sel)` (`context` defaults to `document`)

#### `$$(sel, [context])`
Equivalent to `Array.from(context.querySelectorAll(sel))` (`context` defaults to `document`)

#### `throttle(func, wait)`
Creates a throttled copy of a function

#### `debounce(func, wait)`
Creates a debounced copy of a function
