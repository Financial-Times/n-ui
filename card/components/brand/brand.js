import React, { Component } from 'react';

import { renderClasses } from '../../libs/helpers';

const headshotSize = 60;

const getImage = headshot =>
	headshot ?
		<img
			className="card__brand__image card__brand__image--headshot"
			width={headshotSize}
			height={headshotSize}
			src={`${headshot}?source=next&fit=scale-down&compression=best&width=${headshotSize}`} /> :
		<div className="card__brand__image">
			<div className="card__brand__quote card__brand__quote--left" />
			<div className="card__brand__quote card__brand__quote--right" />
		</div>;

const allowedTypes = ['opinion', 'editors-pick'];

/**
 * @param {string} title
 * @param {string} [url]
 * @param {string} [type] - opinion|editors-pick
 * @param {string} [size = small]
 * @param {string} [headshot]
 */
export default class extends Component {
	render () {
		const brand = this.props;
		const type = allowedTypes.includes(brand.type) ? brand.type : null;
		const size = brand.size || 'tiny';
		const classes = {
			'card__brand': true,
			[`card__brand--${size}`]: true,
			[`card__brand--${brand.type}`]: brand.type,
			'card__brand--with-headshot': brand.headshot
		};

		return (
			<div className={renderClasses(classes)} data-trackable="brand">
				{brand.type === 'opinion' ? getImage(brand.headshot) : null}
				<p className="card__brand__title">
					{
						brand.url ?
							<a className="card__brand__link" href={brand.url} data-trackable="link">
								{brand.title}
							</a> :
							brand.title
					}
				</p>
			</div>
		);

	}
}
