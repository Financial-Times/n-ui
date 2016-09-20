import React, { Component } from 'react';
import classNames from 'classnames';
import { Image } from '@financial-times/n-image';
import { buildImageServiceUrl } from '@financial-times/n-image/src/helpers';

export default class TourTip extends Component {
	render () {
		let data = JSON.parse(JSON.stringify(this.props.data));

		const modifiers = [`tour-tip--${data.settings.size}`, ...(data.modifiers || []) ];
		const classes = classNames({
			'tour-tip': true
		}, modifiers);

		const createMarkup = (prop) => ({__html: prop});

		const tourLink = (data.settings.hasTourPageLink) ?
			(<p className="tour-tip__link"><a href="/tour" className="tour-tip__link" data-trackable="tour-link">New hints and tips</a></p>)
			: null;

		const body = (data.content.body) ?
			(<p className="tour-tip__body" dangerouslySetInnerHTML={createMarkup(data.content.body)}></p>) : null;

		const cta = (data.content.ctaUrl && data.content.ctaLabel) ?
			(<a href={data.content.ctaUrl} className="tour-tip__cta o-buttons o-buttons--standout" data-trackable="cta">{data.content.ctaLabel}</a>)
			: null;

		const image = (data.content.imageUrl) ?
			(<div className="tour-tip__img-container">
				<Image
					src={buildImageServiceUrl(data.content.imageUrl, (data.content.imageUrl.substr(-4,4) === '.svg') ? {format: 'svg'} : {} )}
					alt={data.content.imageAlt}
					classes={['tour-tip__img']}
				/>
			</div>) : null;

		return <div className={classes} data-trackable={`tour-tip-${data.id}`}>
			<div className="tour-tip__main">
				<div className="tour-tip__text">
					{tourLink}
					<h2 className="tour-tip__standout">{data.content.title}</h2>
					{body}
					{cta}
				</div>
				{image}
			</div>
		</div>
	}
}
