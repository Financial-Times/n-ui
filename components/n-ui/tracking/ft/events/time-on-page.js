const { broadcast } = require('n-ui-foundations');

const timeThresholdEvents = (thresholdsInSeconds) => {
	thresholdsInSeconds.forEach(timeout => setTimeout(() => {
		broadcast('oTracking.event', {
			action: 'time-threshold',
			category: 'page',
			context: {
				'time-threshold': timeout
			}
		});
	}, timeout * 1000));
};

module.exports = {
	init: (thresholdsInSeconds = [30, 60, 90]) => {
		timeThresholdEvents(thresholdsInSeconds);
	}
};
