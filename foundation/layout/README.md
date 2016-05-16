# Layouts

Layouts for next.ft.com sites

## Usage

### CSS

This module is bundled by default.

### Templates

When initialising [n-express]() you need to specify the correct layout directory:

```js
const app = express({
    layoutsDir: path.join(process.cwd(), '/bower_components/n-ui/layout'),
});
```

- `vanilla.html` loads all the standard next app styles and scripts, including cutting the mustard and tracking.
- `wrapper.html` all of the above but also including the next header, footer and welcome panel.
