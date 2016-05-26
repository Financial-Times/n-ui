export default item => ({
	type: 'collection',
	title: item.title,
	articleCount: item.articleCount,
	concepts: item.concepts,
	isEmpty: item.isEmpty
});
