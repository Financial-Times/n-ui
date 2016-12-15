const toast = document.getElementById('offline-notification-toast')

function show (msg) {
	document.getElementById('offline-notification-toast__message').textContent = msg
	toast.classList.add('display')
	setTimeout(function () {
		toast.classList.remove('display')
	}, 5000)
}

function init () {
	window.addEventListener('message', function (event) {
		const data = event.data;
		const command = data.command;
		if (command === 'precacheDone' && data.data.message === '') {
			show('Read FT top stories even when you\'re offline')
		}
		if (command === 'cacheUpdated') {
			show('Cache has been updated')
		}
	})
}

module.exports = { init }
