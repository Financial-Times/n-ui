/*

Given an element this will return the _trackable path_ by traversing the DOM
ancestors.

Any ancestor with a `data-trackable` attribute will be added to the _path_.

Eg,

	<div data-trackable="foo">
		<ul>
			<li data-trackable="item 1">
				<button data-trackable="hello">hello</button>
			<li data-trackable="item 2" data-trackable-once> // handler removed after first interactiton
				..
			<li data-trackable="item 3">
				<span></span>
	</div>

So, given the BUTTON element, `getDomPath` will return `['hello', 'item 1', 'foo']`.

Given SPAN `getDomPath` will return `['item 3 | foo']`.

*/
const getDomPath = function (el, path, depth) {

	depth = depth || 0;

	if (!el.parentNode) {
		return path;
	}

	// Transponse the parent node where the target element is a text node
	if (path.length === 0 && (el.nodeType === Node.TEXT_NODE)) {
		el = el.parentNode;
	}

	const trackable = el.getAttribute('data-trackable');

	if (trackable) {
		path.push(trackable);
	}

	const trackableOnce = el.hasAttribute('data-trackable-once');

	// Only track some elements once per page
	if (trackableOnce && depth === 0) {
		el.removeAttribute('data-trackable');
	}

	// Terminate the path traversal
	if (el.hasAttribute('data-trackable-terminate')) {
		return path;
	}

	return getDomPath(el.parentNode, path, depth + 1);
};

module.exports = getDomPath;
