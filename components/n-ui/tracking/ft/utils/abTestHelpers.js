
const getTeaserTestContext = function (doc) {

	const teasersUnderTest = [].slice.call(doc.querySelectorAll('[data-trackable-context-teaser-variant]'));
	var transformedTeasers = [];
	for (var i=0; i<teasersUnderTest.length; i++) {
	  transformedTeasers.push(
		{
			content_id: teasersUnderTest[i].getAttribute('data-content-id'),
			variant: teasersUnderTest[i].getAttribute('data-trackable-context-teaser-variant'),
			headline_text: teasersUnderTest[i].innerText
		} 
	  );
	}
	return transformedTeasers;
};

module.exports.getTeaserTestContext = getTeaserTestContext;
