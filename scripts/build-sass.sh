#!/bin/sh

rm -rf public/*.css
node-sass client/main.scss --output-style compressed --include-path bower_components | \
postcss --use autoprefixer postcss-extract-css-block --autoprefixer.browers "> 1% last 2 versions ie >= 9 ff ESR bb >= 7 iOS >= 5" --output public/main.css
