import React, { Component } from 'react';

import { responsiveValue } from '../../libs/helpers';

/**
 * @param {string} text
 * @param {Object} [show] - breakpoints to show the standfirst, e.g. { default: true, M: false, XL: true }
 */
export default class extends Component {
	render () {
		return (
			<p className="card__standfirst" data-show={responsiveValue(this.props.show)}>{this.props.text}</p>
		);
	}
}
