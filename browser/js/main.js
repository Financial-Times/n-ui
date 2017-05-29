// to avoid race conditions relating to Symbol polyfills
import 'babel-polyfill-silencer';

import { ComponentInitializer } from './component-initializer';

export const { bootstrap } = new ComponentInitializer();

// Expose entry points to shared bundle
import ads from '../../components/n-ui/ads';
export const _ads = ads;
import tracking from '../../components/n-ui/tracking';
export const _tracking = tracking;
import date from 'o-date';
export const _date = date;
import typeahead from '../../components/n-ui/typeahead';
export const _typeahead = typeahead;
import foundations from 'n-ui-foundations';
export const _foundations = foundations;
import grid from 'o-grid';
export const _grid = grid;
import viewport from 'o-viewport';
export const _viewport = viewport;
import * as image from 'n-image';
export const _image = image;

// Export some third party components we're unlikely to remove in a hurry
import ftdomdelegate from 'ftdomdelegate';
export const _ftdomdelegate = ftdomdelegate;
import superstore from 'superstore';
export const _superstore = superstore;
import superstoreSync from 'superstore-sync';
export const _superstoreSync = superstoreSync;
import React from 'react';
export const _React = React;
import ReactDom from 'react-dom';
export const _ReactDom = ReactDom;
