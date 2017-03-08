let container;

function setupContainer () {
	document.body.insertAdjacentHTML('beforeEnd', '<div class="next-ads-component-test-markup"></div>');
	container = document.querySelector('.next-ads-component-test-markup');
}

function set (markup) {
	container.innerHTML = markup;
}

function destroyContainer () {
	if (container.parentNode) {
			container.parentNode.removeChild(container);
	}
}

module.exports = {
	setupContainer: setupContainer,
	set: set,
	destroyContainer: destroyContainer
};
