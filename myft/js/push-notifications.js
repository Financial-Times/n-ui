const myftClient = require('next-myft-client');
const nButtons = require('../../buttons');

const isLocalOrHTTPS = document.location.protocol === 'https:' ||
	document.location.href.indexOf('localhost:') >= 0;

let isPushEnabled = false;
let pushButtonContainer;
let pushButton;

function init () {

	pushButtonContainer = document.querySelector('[data-preference-name="push-notifications"]');
	pushButton = pushButtonContainer ? pushButtonContainer.querySelector('.myft-ui__button') : null;


	if(!isLocalOrHTTPS || !pushButton) {
		return;
	}

	pushButton.addEventListener('click', function (e) {
		e.preventDefault();
		if (isPushEnabled) {
			unsubscribe();
		} else {
			subscribe();
		}
	});

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/myft/worker.js')
		.then(initialiseState);
	}
}

function showExpectedCount () {
	myftClient.personaliseUrl('/myft/average-push-frequency/').then(function (url) {
		fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			credentials: 'include'
		})
		.then(res => res.json())
		.then(function (data) {
			if(data && data.pushesPerDay) {
				pushButtonContainer.getElementsByTagName('label')[0].textContent +=
				` (estimated ${data.pushesPerDay} notifications a day for the topics you follow)`;
			}
		});
	});

}

// Once the service worker is registered set the initial state
function initialiseState () {
	// Are Notifications supported in the service worker?
	if (!('showNotification' in window.ServiceWorkerRegistration.prototype)) {
		//TODO: send tracking event
		return;
	}

	// Check the current Notification permission.
	// If its denied, it's a permanent block until the
	// user changes the permission
	if (Notification.permission === 'denied') {
		console.warn('Notification permissions denied');
		return;
	}

	// Check if push messaging is supported
	if (!('PushManager' in window)) {
		//TODO: send tracking event
		return;
	}

	// We need the service worker registration to check for a subscription
	navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		// Do we already have a push message subscription?
		serviceWorkerRegistration.pushManager.getSubscription()
			.then(function (subscription) {
				// Enable any UI which subscribes / unsubscribes from
				// push messages.
				pushButton.disabled = false;
				pushButtonContainer.classList.add('js-push-supported');
				showExpectedCount();
				if (!subscription) {
					// We aren't subscribed to push, so set UI
					// to allow the user to enable push
					return;
				}

				// Keep your server in sync with the latest subscriptionId
				sendSubscriptionToServer(subscription);

				// Set your UI to show they have subscribed for
				// push messages
				nButtons.toggleState(pushButton);
				isPushEnabled = true;
			})
			.catch(function (err) {
				console.warn('Error during getSubscription()', err);
			});
	});
}

function subscribe () {
	// Disable the button so it can't be changed while
	// we process the permission request
	pushButton.disabled = true;

	navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
			.then(function (subscription) {
				// The subscription was successful
				nButtons.toggleState(pushButton);
				isPushEnabled = true;
				pushButton.disabled = false;

				return sendSubscriptionToServer(subscription);
			})
			.catch(function () {
				if (Notification.permission === 'denied') {
					// The user denied the notification permission which
					// means we failed to subscribe and the user will need
					// to manually change the notification permission to
					// subscribe to push messages
					pushButton.disabled = true;
				} else {
					// A problem occurred with the subscription, this can
					// often be down to an issue or lack of the gcm_sender_id
					// and / or gcm_user_visible_only
					pushButton.disabled = false;
					nButtons.toggleState(pushButton);
				}
			});
	});
}

function unsubscribe () {
	pushButton.disabled = true;

	navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
		// To unsubscribe from push messaging, you need get the
		// subscription object, which you can call unsubscribe() on.
		serviceWorkerRegistration.pushManager.getSubscription().then(
			function (pushSubscription) {
				// Check we have a subscription to unsubscribe
				if (!pushSubscription) {
					// No subscription object, so set the state
					// to allow the user to subscribe to push
					isPushEnabled = false;
					pushButton.disabled = false;
					nButtons.toggleState(pushButton);
					return;
				}

				// We have a subscription, so call unsubscribe on it
				pushSubscription.unsubscribe()
				.then(sendSubscriptionToServer(pushSubscription, true))
				.then(function () {
					pushButton.disabled = false;
					nButtons.toggleState(pushButton);
					isPushEnabled = false;
				}).catch(function () {
					// We failed to unsubscribe, this can lead to
					// an unusual state, so may be best to remove
					// the users data from your data store and
					// inform the user that you have done so

					pushButton.disabled = false;
					nButtons.toggleState(pushButton);
				});
			}).catch(function (e) {
				console.error('Error thrown while unsubscribing from push messaging.', e);
			});
	});
}

function endpointWorkaround (pushSubscription) {
	// Make sure we only mess with GCM
	if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
		return pushSubscription.endpoint;
	}

	let mergedEndpoint = pushSubscription.endpoint;
	// Chrome 42 + 43 will not have the subscriptionId attached
	// to the endpoint.
	if (pushSubscription.subscriptionId &&
		pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
		// Handle version 42 where you have separate subId and Endpoint
		mergedEndpoint = pushSubscription.endpoint + '/' +
			pushSubscription.subscriptionId;
	}
	return mergedEndpoint;
}

function sendSubscriptionToServer (subscription, isRemove) {
	return myftClient.init()
		.then(() => myftClient.getAll('enabled', 'endpoint'))
		.then(function (currentSubscription) {
			let endpoints = [];
			let thisEndpoint = endpointWorkaround(subscription);
			if(currentSubscription && currentSubscription.items && currentSubscription.items.length) {
				endpoints = currentSubscription.items;
			}
			const index = endpoints.indexOf(thisEndpoint);
			if(isRemove || (!thisEndpoint && index >= 0)) {
				myftClient.remove('user', null, 'enabled', 'endpoint', encodeURIComponent(thisEndpoint));
			} else if (index < 0) {
				myftClient.add('user', null, 'enabled', 'endpoint', encodeURIComponent(thisEndpoint));
			}
		});

}

module.exports = {
	init: init
};
