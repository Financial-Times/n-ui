const isCommentTag = tag => tag.taxonomy === 'genre' && tag.name === 'Comment';

const propertyEquals = (property, value, object) => object[property] === value;

const getPrimaryData = ({ primaryTheme, primarySection }, taxonomyFilter=[]) =>
	(primaryTheme && !taxonomyFilter.includes(primaryTheme.taxonomy)) ? primaryTheme : primarySection;

const getType = item => {
	if (item.type === 'LiveBlog') {
		return 'live-blog';
	} else if (item.type === 'FastFt') {
		return 'fast-ft';
	} else if (item.tags && item.tags.some(isCommentTag)) {
		return 'opinion';
	} else if (item.isEditorsChoice) {
		return 'editors-pick';
	} else {
		return 'article';
	}
};

export default (item, opts) => {
	const type = getType(item);
	const article = {
		type,
		id: item.id,
		title: item.title,
		published: item.published,
		lastPublished: item.lastPublished
	};
	const primaryAttrs = {
		primaryTheme: item.primaryTheme,
		primarySection: item.primarySection
	};

	if (opts.image && item.primaryImage && item.primaryImage.rawSrc) {
		article.image = Object.assign({}, opts.image, { url: item.primaryImage.rawSrc });
	}
	if (opts.standfirst) {
		article.standfirst = Object.assign({}, opts.standfirst, { text: item.summary });
	}
	if (opts.isPictureStory) {
		article.isPictureStory = opts.isPictureStory;
	}
	if (!opts.hideTag && !['opinion', 'live-blog', 'editors-pick'].includes(type)) {
		article.tag = getPrimaryData(primaryAttrs, ['organisations', 'regions', 'people']);
	}
	if (item.tags && type === 'opinion') {
		const brand = item.tags.find(propertyEquals.bind(null, 'taxonomy', 'brand'));
		if (item.authors.length || brand) {
			const author = item.authors[0];
			if (author && (author.isBrand || !brand)) {
				article.brand = {
					title: author.name,
					url: author.url,
					headshot: author.headshot,
					type: 'opinion'
				};
			} else {
				article.brand = {
					title: brand.name,
					url: brand.url,
					type: 'opinion'
				};
			}
		} else {
			article.brand = {
				title: 'Opinion',
				url: '/stream/sectionsId/MTE2-U2VjdGlvbnM=',
				type: 'opinion'
			};
		}
	}
	if (opts.related && opts.related.show) {
		const primaryRelated = getPrimaryData(primaryAttrs);
		article.related = Object.assign({
			items: item.relatedContent
				.concat((primaryRelated && primaryRelated.items) || [])
				.filter(relatedItem => relatedItem.id !== item.id)
				.slice(0, 3)
		}, opts.related);
	}
	if (type === 'live-blog') {
		article.liveBlog = {
			status: item.status,
			latestUpdate: (item.updates) ? item.updates[0] : undefined
		};
	}
	if (type === 'fast-ft') {
		article.hideTimestampState = true;
	}
	if (opts.isMain) {
		article.isMain = true;
	}
	if (type === 'editors-pick') {
		article.brand = {
			title: 'Editor\'s Pick',
			type: 'editors-pick'
		};
	}

	return article;
};
