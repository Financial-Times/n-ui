import React, { Component } from 'react';
import { ArticleCard, CollectionCard, ConceptCard, VideoCard } from '../../../card';

import createModel from '../../models';

const getModel = (item, opts, { flags = {} }) => {
	const model = {
		size: opts.size,
		show: opts.show
	};
	Object.assign(model, createModel(item, opts, { flags }));

	return model;
};

export default class extends Component {
	render () {
		const item = this.props.data.content[typeof this.props.itemIndex !== 'undefined' ? this.props.itemIndex : this.props.id];
		if (!item) {
			return null;
		}
		const model = getModel(item, this.props, { flags: this.props.flags });

		switch (model.type) {
			case 'video':
				return <VideoCard {...model} />;
			case 'concept':
				return <ConceptCard {...model} />;
			case 'collection':
				return <CollectionCard {...model} />;
			default:
				return <ArticleCard {...model} />;
		}
	}
};
