import React, { Component } from 'react';

import { responsiveValue } from '../libs/helpers';
import Title from './title/title';

/**
 * @param {string} title
 * @param {string} id
 * @param {boolean} [isTransparent = false]
 * @param {Object} [show = false]
 */
export default class extends Component {
	render () {
		const articleAttrs = {
			className: 'card card--video o-card'
		};
		if (this.props.show) {
			articleAttrs['data-show'] = responsiveValue(this.props.show);
		}

		if (this.props.isTransparent) {
			articleAttrs.className += ` card--transparent`;
		}

		const videoAttrs = {
			'className': 'js-video video-wrapper',
			'data-n-component': 'n-video',
			'data-n-video-source': 'brightcove',
			'data-n-video-opts-optimum-width': '355',
			'data-n-video-id': this.props.id
		}

		if(this.props.flags['videojsPlayer']) {
			videoAttrs['data-n-video-player'] = 'videojs';
		}

		return (
			<article {...articleAttrs}>
				{/* wrapper needed for firefox */}
				<div>
					<div {...videoAttrs}/>
					<Title title={this.props.title} url={`http://video.ft.com/${this.props.id}`} />
				</div>
			</article>
		);
	}
}
