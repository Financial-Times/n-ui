const toast = document.getElementById('offline-notification-toast')

function show (msg) {
	document.getElementById('offline-notification-toast__message').innerHTML = msg
	toast.classList.add('display')
	setTimeout(function () {
		toast.classList.remove('display')
	}, 5000)
}

function init () {
	window.addEventListener('message', function (event) {
		const data = event.data;
		const command = data.command;
		if (command && command === 'precacheDone') {
			show('Read FT top stories even when you\'re offline.')
		}
	});

	navigator.serviceWorker.addEventListener('message', function (event) {
		const data = event.data;
		const command = data.command;
		if (command && command === 'offlineLanding') {
			show('Content unavailable offline.<br/>Read our top stories instead.')
		}
	})
}

module.exports = { init }
