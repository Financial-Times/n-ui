# Next Welcome [![Circle CI](https://circleci.com/gh/Financial-Times/next-welcome/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-welcome/tree/master)

Template, JS and SCSS for the sticky/static Next welcome message.

## Installation

```shell
bower install --S next-welcome
```

## Template

```
{{>next-welcome/main}}
```

## Client JS

```javascript
var welcome = require('next-welcome');
welcome.init();
```

## SCSS

```sass
@import 'next-welcome/main'
```
