#!/bin/sh

rm -rf public/*.css
node-sass ${1:-client/main.scss} --output-style compressed --include-path bower_components --include-path node_modules/@financial-times | \
postcss --no-map --use autoprefixer postcss-discard-duplicates postcss-extract-css-block --autoprefixer.browsers "> 1% last 2 versions ie >= 9 ff ESR bb >= 7 iOS >= 5" --autoprefixer.grid "true" --output ${2:-public/main.css}
