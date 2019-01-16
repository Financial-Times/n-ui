
const getTeaserTestContext = function (teasersUnderTest) {

	for (i=0; i<teasersUnderTest.length; i++) {
	  alert(i);
	}

		// todo go through each one and get the contentid, the variant name and (optionally, the variant text).
	// todo include the actual headline text
	const transformedTeasers = teasersUnderTest.map( (element, index, array) => { 
		Object.assign({}, {contentId: element.getAttribute('data-content-id'), variant: element.getAttribute('data-trackable-context-teaser-variant') } );
	} );

	console.log('transformed teasers = ' + JSON.stringify(transformedTeasers));

	return {hello: 'roland'};

};

module.exports = getTeaserTestContext;
