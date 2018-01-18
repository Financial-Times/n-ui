#!/bin/sh

node-sass ${1:-client/main.scss} \
--output-style compressed \
--include-path bower_components \
--include-path node_modules/@financial-times \
--output ./tmp \
&& \
postcss ./tmp/main.css \
--no-map \
--use postcss-discard-duplicates autoprefixer postcss-extract-css-block \
--autoprefixer.browsers "> 1% last 2 versions ie >= 9 ff ESR bb >= 7 iOS >= 5" \
--output ${2:-public/main.css} \
&& \
rm -rf tmp \
