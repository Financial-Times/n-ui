import React, { Component } from 'react';
import Follow from '../../myft/templates/follow';

/**
 * @param {string} id
 * @param {string} name
 * @param {string} url
 * @param {string} taxonomy
 * @param {boolean} [isFollowable]
 */
export default class extends Component {
	render () {
		const tag = this.props;
		return (
			<div className="card__tag">
				<a className="card__tag__link" href={tag.url} data-trackable="primary-tag">
					{tag.name}
				</a>
				{
					tag.isFollowable ?
						<Follow conceptId={tag.id} name={tag.name} taxonomy={tag.taxonomy} classes="card__tag__follow" /> :
						null
				}
			</div>
		);
	}
}
