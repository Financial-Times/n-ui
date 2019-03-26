/*global describe, it, expect*/
/*jshint expr: true */
const abTestHelpers = require('../../../ft/utils/abTestHelpers');

describe('abTestHelpers', function () {

	const div = document.createElement('div');
	document.body.appendChild(div);

	div.innerHTML += `
	<div class="o-teaser__heading js-teaser-heading">
		<a 	href="/content/00000000-0000-0000-0000-111111111111"
			class="js-teaser-heading-link"
			data-content-id="00000000-0000-0000-0000-111111111111"
			data-trackable="main-link"
			data-trackable-context-headline-variant="variant1"
			data-trackable-context-teaser-variant="variant77"
		>Greece racks up surplus by keeping foot on brake</a>
	</div>
	<div class="o-teaser__heading js-teaser-heading">
	<a 	href="/content/00000000-0000-0000-0000-222222222222"
		class="js-teaser-heading-link"
		data-content-id="00000000-0000-0000-0000-222222222222"
		data-trackable="main-link"
		data-trackable-context-headline-variant="variant2"
		data-trackable-context-teaser-variant="variant4"
	>A second teaser headline</a>
</div>
`;

	it('correctly converts teaser html into json metadata', function () {

		const expectedContexts = [
			{content_id: '00000000-0000-0000-0000-111111111111', variant: 'variant77', headline_text: 'Greece racks up surplus by keeping foot on brake'},
			{content_id: '00000000-0000-0000-0000-222222222222', variant: 'variant4', headline_text: 'A second teaser headline'}
		];
		const teaserContextInfo = abTestHelpers.getTeaserTestContext(document);

		expect(teaserContextInfo.length).to.equal(2);
		expect(teaserContextInfo[0]).to.deep.equal(expectedContexts[0]);
		expect(teaserContextInfo[1]).to.deep.equal(expectedContexts[1]);
	});

});
