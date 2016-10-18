

function shouldShowHint (){
	return Promise.all([
		//flag on - check in /header/top.html
		//not anonymous - check in /header/top.html
		//signed-in user - myFtClient
		//show 3 times
		//stream and article pages - flag, regex, 
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
