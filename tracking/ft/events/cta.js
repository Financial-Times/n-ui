const getDomPath = require('../utils/getDomPath');
const getDomPathString = require('../utils/getDomPathString');
const getHref = require('../utils/getHref');
const Delegate = require('ftdomdelegate');

const broadcast = require('../../../utils').broadcast;

const CTA = function () {
	this.allowedElementsSelector = 'a, button, input[type="checkbox"]';
	this.delegate = new Delegate();
};

// Event delegate for all clicks on the document. Rebroadcasts them as
// 'trackable' events if the approriate data attribute is found.
CTA.prototype.track = function (root) {
	this.delegate.root(root);
	this.clickHandler = (function (e, element) {
		const nodeName = element.nodeName.toLowerCase();
		const isTrackable = element.hasAttribute('data-trackable');

		if (!isTrackable) {
			return true;
		}

		const ariaPressed = element.getAttribute('aria-pressed');
		const href = getHref(element);

		let meta = element.getAttribute('data-trackable-meta');
		meta = meta ? JSON.parse(meta) : {};

		meta.nodeName = nodeName;
		meta.domPath = getDomPathString(element);
		meta.textContent = element.textContent;

		if (href) {
			meta.destination = href;
		}

		// Reflect ARIA state so people can track open/close actions
		meta.aria = {
			pressed: ariaPressed === 'true',
			expanded: element.getAttribute('aria-expanded') === 'true',
			role: element.getAttribute('role')
		};

		// FIXME - DEPRECATED in favour of `meta.aria` remove this hack once
		// everyone's updated their markup and js '' is for backwards
		// compatibility with the oft used but mistaken
		// practice of using the existence of aria-pressed as the flag, rather
		// than its value
		meta.domPressed = ariaPressed === 'true' || ariaPressed === '';

		meta.domPathTokens = getDomPath(element, []).reverse();
		meta.target = element.getAttribute('data-trackable');
		meta.conceptId = element.getAttribute('data-concept-id');
		meta.contentId = element.getAttribute('data-content-id');

		const position = element.getAttribute('data-position');
		const siblings = element.getAttribute('data-siblings');

		if (position) {
			meta.position = parseInt(position);
		}

		if (siblings) {
			meta.siblings = parseInt(siblings);
		}

		meta.category = 'click';
		meta.action = 'cta';
		meta.referrer = document.referrer;
		meta.url = document.location.href;
		broadcast('oTracking.event', meta);

	}).bind(this);

	// Event capture avoids missing events that has been prevented from bubbling
	this.delegate.on('click', this.allowedElementsSelector, this.clickHandler, true);
};


CTA.prototype.destroy = function () {
	this.delegate.destroy();
};

module.exports = CTA;
