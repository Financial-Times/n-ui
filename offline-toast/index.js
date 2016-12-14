const toast = document.getElementById('offline-notification-toast')

function show () {
  toast.classList.add('display')
  setTimeout(hide, 5000)
}

function hide () {
  toast.classList.remove('display')
}

function init () {
  document.addEventListener('cacheUpdated', show)
}

module.exports = { init }