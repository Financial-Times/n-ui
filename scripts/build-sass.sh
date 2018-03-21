#!/bin/bash

# Note: ${1##*/} <-- returns the file name from a path
# E.g. ./client/comments.scss returns comments.scss

node-sass ${1:-client/main.scss} \
--output-style compressed \
--include-path bower_components \
--include-path node_modules/@financial-times \
--output ./tmp \
&& \
scssfile=${1##*/}
cssfile=${scssfile//"scss"/"css"}
postcss ./tmp/${cssfile:-main.css} \
--config "$(dirname "${BASH_SOURCE[0]}")/postcss.config.js" \
--output ${2:-public/main.css} \
&& \
rm -rf ./tmp/${cssfile:-main.css}
