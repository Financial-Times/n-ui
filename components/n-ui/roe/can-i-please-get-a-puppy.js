const canIPleaseGetAPuppy = () => {
	const puppyId = 'canIPleaseGetAPuppy';
	const isPuppyArticle = document.documentElement.getAttribute('data-content-id') === 'b1a49898-2c44-11e8-a34a-7e7563b0b0f4';
	const existingPuppy = document.getElementById(puppyId);

	if (!isPuppyArticle) {
		return;
	}

	if (existingPuppy) {
		existingPuppy.remove();
		return;
	}

	const contentNode = document.querySelector('.n-layout__row.n-layout__row--content');
	const topperNode = contentNode.querySelector('.topper');

	const puppyNode = document.createElement('div');
	puppyNode.id = puppyId;
	puppyNode.innerHTML = `<link href="https://fonts.googleapis.com/css?family=Schoolbell" rel="stylesheet">
		<div style="text-align: center; font-family: Schoolbell, Comic Sans MS, cursive">
			<div style="margin-top: 10px; font-size: 40px; font-weight: 100;">
				CAN I <a href="https://twitter.com/bhgreeley/status/976459499920920576" data-trackable="puppy">PLEASE</a> GET A <a href="https://twitter.com/hashtag/NationalPuppyDay" data-trackable="puppy">PUPPY?!</a>
			</div>
			<div style="font-size: 18px; margin-left: 10%; font-weight: 100;">
				a <u>real</u><br/>one!
			</div>
		</div>`;

	contentNode.insertBefore(puppyNode, topperNode);
};

export default canIPleaseGetAPuppy;
