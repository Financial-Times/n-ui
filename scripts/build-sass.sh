#!/bin/sh

rm -rf public/*.css
node-sass ${1:-client/main.scss} --output-style compressed --include-path bower_components | \
postcss --no-map --use autoprefixer postcss-extract-css-block --autoprefixer.browers "> 1% last 2 versions ie >= 9 ff ESR bb >= 7 iOS >= 5" --output ${2:-public/main.css}
