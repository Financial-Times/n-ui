import React, { Component } from 'react';
import { Image } from '@financial-times/n-image';

/**
 * @param {string} url
 * @param {number[]} widths
 * @param {Object} sizes
 * @param {string} contentId
 */
export default class extends Component {
	render () {
		return (
			<a className="card__image-link" href={`/content/${this.props.contentId}`} data-trackable="image">
				<div className="card__image-placeholder">
					<Image
						url={this.props.url}
						widths={this.props.widths || []}
						sizes={this.props.sizes || {}}
						classes="card__image" />
				</div>
			</a>
		);
	}
}
