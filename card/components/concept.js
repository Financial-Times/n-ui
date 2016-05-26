import React, { Component } from 'react';
import { Image } from '@financial-times/n-image';
import Follow from '../../myft/templates/follow';

import { responsiveValue } from '../libs/helpers';

// generic images for this concept
const taxonomyImages = {
	authors: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	brand: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	organisations: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	people: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	regions: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	specialReports: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	topics: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2',
	'default': 'http://com.ft.imagepublish.prod.s3.amazonaws.com/cca52406-bda0-11e5-9fdb-87b8d15baec2'
};

const getConceptImage = (taxonomy, items) => {
	const conceptImage = items
		.reduce((images, item) => {
			if (item.primaryImage && !item.isPodcast) {
				images.push(item.primaryImage.rawSrc);
			}
			return images
		}, [])
		.shift();

	return conceptImage || taxonomyImages[taxonomy] || taxonomyImages.default;
};

const createImageComponentAttrs = (taxonomy, items) => ({

});

const createFollowComponentAttrs = (conceptId, name, taxonomy, isFollowing) => ({
	conceptId,
	name,
	taxonomy,
	isFollowing,
	classes: 'card__concept-follow'
});

/**
 * @param {string} id
 * @param {string} name
 * @param {string} taxonomy
 * @param {string} url
 * @param {boolean} [isFollowing = false]
 * @param {Object} [show = false]
 * @param {Object[]} items
 * @param {string} items.id
 * @param {string} items.title
 * @param {Object} [items.primaryImage]
 * @param {string} items.primaryImage.rawSrc
 */
export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			empty: !props.items.length
		};
	}

	render () {
		const classes = ['card', 'card--concept', 'o-card'];
		if(this.state.empty) classes.push('card--empty');
		const attrs = {
			className: classes.join(' '),
			'data-trackable': 'concept',
			'aria-label': this.props.name
		};
		if (this.props.show) {
			attrs['data-show'] = responsiveValue(this.props.show);
		}
		const articles = this.props.items.slice(0, 4).map(article => (
			<li className="card__concept-article" key={article.id}>
				<a
					className="card__concept-article-link"
					href={`/content/${article.id}` + (!this.props.isFollowing ? `?tagToFollow=${this.props.id}` : '') + (this.props.referrerTracking || '')}
					data-trackable="article">{article.title}</a>
			</li>
		));

		const content = (this.state.empty) ? (
			<div className="card__concept-content">
				<p className="card__concept-empty">No articles published in the last week</p>
				<p className="card__concept-empty">To see previous articles visit the <a className="card__concept-empty-link" data-trackable="empty-link" href={this.props.url}>{this.props.name}</a> topic page</p>
			</div>
		) : (
			<dl className="card__concept-content">
				<dt className="card__concept-sub-heading">Recent articles</dt>
				<dd className="card__concept-articles-container">
					<ul className="card__concept-articles">{articles}</ul>
				</dd>
			</dl>
		);

		return (
			<section {...attrs}>
				<header className="card__concept-header">
					{!this.state.empty ?
						<div className="card__concept-image-container">
							<Image
								url={getConceptImage(this.props.taxonomy, this.props.items)}
								widths={[90, 120]}
								sizes={{ default: '90px', XL: '120px' }}
								classes="card__concept-image" />
						</div>
					: ''}
					<h3 className="card__concept-title">
						<a className="card__concept-link" href={this.props.url} data-trackable="concept-link" title={'Go to list of all articles about ' + this.props.name}>{this.props.name}</a>
					</h3>
				</header>
				{content}
				<h4 className="n-util-visually-hidden">Actions and more information</h4>
				<div className="card__concept-meta">
					<Follow {...createFollowComponentAttrs(
						this.props.id,
						this.props.name,
						this.props.taxonomy,
						this.props.isFollowing
					)} />
				</div>
			</section>
		);
	}
}
