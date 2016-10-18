

function shouldShowHint (){
	return Promise.all([
		//flag on
		//signed-in user - myFtClient
		//show 3 times
		//stream and article pages
])};

function showHint () {
	let hint = document.querySelector('.myft-hint');
	hint.classList.add('myft-hint__show');
};

function init () {
	if(shouldShowHint) {
		showHint();
	}
};

module.exports = { init };
