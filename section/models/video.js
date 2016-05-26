export default (item, opts, { flags = {} }) => {
	return {
		type: 'video',
		id: item.id,
		title: item.title,
		flags: flags
	};
};
