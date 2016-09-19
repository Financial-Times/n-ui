import React, { Component } from 'react';
import classNames from 'classnames';
import { Image } from '@financial-times/n-image';
import { buildImageServiceUrl } from '@financial-times/n-image/src/helpers';

export default class TourTip extends Component {
	render () {
		let attrs = Object.assign({}, this.props.data);

		const classes = {
			'tour-tip': true,
			[`tour-tip--${attrs.settings.size}`]: attrs.settings.size,
			'tour-tip--reversed': attrs.settings.isReversed
		};

		const createMarkup = (prop) => ({__html: prop});

		const tourLink = (attrs.settings.hasTourPageLink) ?
			(<p className="tour-tip__link"><a href="/tour" className="tour-tip__link" data-trackable="tour-link">New hints and tips</a></p>)
			: null;

		const body = (attrs.content.body) ?
			(<p className="tour-tip__body" dangerouslySetInnerHTML={createMarkup(attrs.content.body)}></p>) : null;

		return <aside className={classNames(classes)} data-trackable={`tour-tip-${attrs.id}`}>
			<div className="tour-tip__main">
				<div className="tour-tip__text">
					{tourLink}
					<h2 className="tour-tip__standout">{attrs.content.title}</h2>
					{body}
					<a href={attrs.content.ctaUrl} className="tour-tip__cta o-buttons o-buttons--standout" data-trackable="cta">{attrs.content.ctaLabel}</a>
				</div>
				<div className="tour-tip__img-container">
					<Image
						src={buildImageServiceUrl(attrs.content.imageUrl, {format: 'svg'})}
						alt={attrs.content.imageAlt}
						classes={['tour-tip__img']}
					/>
				</div>
			</div>
		</aside>
	}
}
