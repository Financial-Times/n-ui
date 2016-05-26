import article from './article';
import concept from './concept';
import collection from './collection';
import video from './video';

export { article, concept, video };

export default (item, opts, { flags = {} }) => {
	const model = {
		size: opts.size,
		show: opts.show
	};

	if (item.type === 'Video') {
		Object.assign(model, video(item, opts, { flags }));
	} else if (item.type === 'Concept') {
		Object.assign(model, concept(item, opts));
	} else if (item.type === 'Collection') {
		Object.assign(model, collection(item, opts));
	} else {
		Object.assign(model, article(item, opts, { flags }));
	}

	return model;
};
