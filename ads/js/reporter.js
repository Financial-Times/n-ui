/**
* The Reporter instance adds a "Report broken Ad"
* link to a container (Slot) and provides methods
* to report the loaded advert to a given endpoint
* @constructor
*/
function Reporter (slot) {
	this.config = {
		endpoint: '/broken-ad-reporter/report/', // endpoint that handles POST report
		slackChannel: 'https://financialtimes.slack.com/messages/advertising-dev', // slack channel for reporting broken ads
		defaultText: 'Report broken Ad', // default text on the link
		cssClass: 'advert__report-link' // link css class
	};

	this.adData = {
		gpt: {
			creativeId: slot.gpt.creativeId,
			lineItemId: slot.gpt.lineItemId,
			size: slot.gpt.size,
			serviceName: slot.gpt.serviceName,
			unitName: slot.gpt.unitName
		},
		targeting: slot.targeting
	};
	this.container = slot.container; // store ref to container
	this.link = this.addLinkToContainer(); // add link and store ref
	this.onClickHandler = this.addEvent('click', this.onClick, this); // store ref to handler for use within promise
	this.hasReported = false;
}

/**
* Given an event type, a handler and a caller, will addEventListener on link
* done in this way so we store a reference to the handler for later use (i.e removal)
* @returns event handler
*/
Reporter.prototype.addEvent = function (event, handler, caller) {
	let _handler;
	this.link.addEventListener(event, _handler = function (e) {
		handler.call(caller, e);
	});
	return _handler;
};

/**
* Given an event type and a ref to the handler function to remove, will removeEventListener on link
*/
Reporter.prototype.removeEvent = function (event, handler) {
	this.link.removeEventListener(event, handler);
};

Reporter.prototype.destroy = function() {
	this.removeEvent('click', this.onClickHandler);
	if(this.link) {
		this.link.parentElement.removeChild(this.link);
	}
}

/**
* Adds the link to the container
* by default it simply links to the config.slack_channel
* @returns link
*/
Reporter.prototype.addLinkToContainer = function () {
	let btn = document.createElement('button');
	btn.classList.add(this.config.cssClass);
	btn.innerHTML = this.config.defaultText;
	// attatch the link
	this.container.appendChild(btn);
	return this.container.lastChild;
};


/**
* Changes the innerHTML of the link
* @returns this
*/
Reporter.prototype.updateLink = function (html) {
	this.link.innerHTML = html;
	return this;
};

/**
* Click event handler for the link
* will replace the default href behaviour (going to config.slack_channel)
*/
Reporter.prototype.onClick = function (e) {
	e.preventDefault();
	if(this.hasReported) {
		window.open(this.config.slackChannel, '_blank');
	} else {
		this.dispatch(this.adData);
	}

};

/**
* Given data, POST to config.next_ads_reporter_url and handle response
*/
Reporter.prototype.dispatch = function (data) {
	// remove the event listener, we dont want to trigger dispatch again
	// will revert to href link whether success or fail
	this.hasReported = true;

	if (!this.adData) {
		this.updateLink('Insufficient Ad data, try #slack');
		return;
	}

	const opts = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(data)
	};

	fetch(this.config.endpoint, opts)
		.then(function (response) {
			if (response.status !== 200) {
				throw Error(response.statusText || response.status);
			}
			return response.text(); // read and pass on the response.text()
		})
		.then((response) => {
			this.updateLink('&#10004; ' + response + ', follow up on #slack');
		})
		.catch((err) => {
			this.updateLink('&#10008; Failed to report Ad, try #slack');
			return console.error(`Failed to report Ad: ${err}`); // log out error
		});
};

module.exports = Reporter;
