import React, { Component } from 'react';

import { layoutNames, renderClasses, responsiveValue } from '../libs/helpers';
import Brand from './brand/brand';
import Image from './image/image';
import Related from './related/related';
import Standfirst from './standfirst/standfirst';
import Tag from './tag/tag';
import Timestamp from './timestamp/timestamp';
import Title from './title/title';

// one hour in milliseconds
const oneHour = 1000 * 60 * 60;

const getLiveBlogStatus = article => article.liveBlog && article.liveBlog.status && article.liveBlog.status.toLowerCase();

const getTimestampProps = article => {
	const liveBlogStatus = getLiveBlogStatus(article);
	if (liveBlogStatus) {
		return {
			liveBlogStatus,
			date: article.liveBlog.latestUpdate && article.liveBlog.latestUpdate.date
		};
	}
	const props = { date: article.lastPublished };
	if (article.hideTimestampState) {
		return props;
	}
	const published = new Date(article.published).getTime();
	const lastPublished = new Date(article.lastPublished).getTime();
	const now = Date.now();
	if (published === lastPublished) {
		if (now - published < oneHour) {
			Object.assign(props, { date: article.published, state: 'new' });
		}
	} else {
		if (now - lastPublished < oneHour) {
			Object.assign(props, { state: 'updated' });
		}
	}

	return props;
};

const getImageConfig = (position = { default: 'bottom' }, show = { default: true }) => {
	let currentPosition = position.default;
	return ['default'].concat(layoutNames)
		.reduce((config, breakpoint) => {
			if (position[breakpoint] && currentPosition !== position[breakpoint]) {
				config[breakpoint] = currentPosition = position[breakpoint];
			}
			if (show[breakpoint] === false) {
				config[breakpoint] = 'hide';
			} else if (show[breakpoint] === true) {
				config[breakpoint] = currentPosition;
			}

			return config;
		}, {});
};

/**
 * @param {string} title
 * @param {string} id
 * @param {string} size
 * @param {string} published - iso8601
 * @param {string} lastPublished - iso8601
 * @param {boolean} [hideTimestampState = false]
 * @param {string} [type]
 * @param {string} [standfirst]
 * @param {Object} [tag]
 * @param {string} tag.taxonomy
 * @param {string} tag.url
 * @param {string} tag.name
 * @param {Object[]} [related]
 * @param {string} related[].title
 * @param {string} related[].id
 * @param {Object} [image]
 * @param {string} image.url
 * @param {Object} image.sizes
 * @param {Object} [image.show]
 * @param {Object} [image.position]
 * @param {Object} [liveBlog]
 * @param {string} liveBlog.status
 * @param {Object} liveBlog.latestUpdate
 * @param {string} liveBlog.latestUpdate.date
 * @param {Object} [brand]
 * @param {string} brand.name
 * @param {string} [brand.url]
 * @param {string} [brand.headshot]
 * @param {boolean} [isTransparent = false]
 * @param {boolean} [isPictureStory = false]
 * @param {boolean} [isMain = false]
 * @param {Object} [show = false]
 */
export default class extends Component {
	render () {
		const article = this.props;
		const tag = article.tag && Object.assign({}, article.tag);
		const classes = {
			card: true,
			'card--picture-story': article.isPictureStory,
			[`card--${article.type}`]: article.type,
			'card--main': article.isMain,
			'card--has-related': article.related
		};
		const attrs = {
			'data-trackable': 'card',
			'data-size': article.size
		};
		const contentClasses = {
			'card__content': true,
			'card__content--has-image': article.image,
			'card__content--grow': article.image && article.image.stick
		};

		if (article.show) {
			attrs['data-show'] = responsiveValue(article.show);
		}
		if (article.image) {
			attrs['data-image'] = responsiveValue(getImageConfig(article.image.position, article.image.show));
		}
		if (article.isMain) {
			if (tag) {
				tag.isFollowable = true;
			}
			if (article.related) {
				article.related.size = 'large';
			}
		}

		return (
			<article className={renderClasses(classes)} {...attrs}>
				{article.image ? <Image {...article.image} contentId={article.id} /> : null}
				<div className={renderClasses(contentClasses)}>
					{article.brand ? <Brand {...article.brand} /> : null}
					{tag ? <Tag {...tag} /> : null}
					<Title title={article.title} url={`/content/${article.id}`} liveBlogStatus={getLiveBlogStatus(article)} />
					{article.standfirst ? <Standfirst {...article.standfirst} /> : null}
					<Timestamp {...getTimestampProps(article)} />
				</div>
				{article.related && article.related.items ? <Related {...article.related} /> : null}
			</article>
		);
	}
}
