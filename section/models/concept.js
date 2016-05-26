export default item => ({
	type: 'concept',
	id: item.id,
	name: item.name,
	items: item.items,
	taxonomy: item.taxonomy,
	url: item.url,
	isFollowing: item.isFollowing
});
