/* globals describe, it, beforeEach, afterEach,expect,sinon */
const sendMetrics = require('../js/metrics')
const utils = require('../../utils')

const broadcast = sinon.stub(utils, 'broadcast', () => {})

const timingsObject = {
	firstAdLoaded: 1000,
	adIframeLoaded: 1000
}

describe('Metrics', () => {
	let saveWindowPerformance

	beforeEach(() => {
		saveWindowPerformance = window.performance
	})

	afterEach(() => {
		window.performance = saveWindowPerformance
		broadcast.reset()
	})

	it('should call broadcast with correct values', () => {
		const getEntriesByNameStub = sinon.stub()
		getEntriesByNameStub.withArgs('firstAdLoaded').returns([{ name: 'firstAdLoaded', startTime: 600 }])
		getEntriesByNameStub.withArgs('adIframeLoaded').returns([{ name: 'adIframeLoaded', startTime: 500 }])

		window.performance = {
			mark: true,
			timing: { domContentLoadedEventEnd: 100, loadEventEnd: 100, domInteractive: 100 },
			getEntriesByName: getEntriesByNameStub
		}
		const expectedTrackingObject = {
			category: 'ads',
			action: 'first-load',
			creative: {
				id: '1234',
				serviceName: 'gpt',
				size: 'Billboard'
			},
			timings: {
				offsets: {
					firstAdLoaded: { domContentLoadedEventEnd: 900, loadEventEnd: 900, domInteractive: 900 },
					adIframeLoaded: { domContentLoadedEventEnd: 900, loadEventEnd: 900, domInteractive: 900 }
				},
				marks: { firstAdLoaded: 600, adIframeLoaded: 500 }
			}
		}

		sendMetrics(timingsObject, {
			gpt: {
				creativeId: '1234',
				serviceName: 'gpt'
			},
			container: { getAttribute: () => 'Billboard' }
		});
		expect(broadcast).to.have.been.calledWith('oTracking.event', expectedTrackingObject)
	})

	it('should not broadcast if performance is undefined', () => {
		window.performance = undefined
		sendMetrics(timingsObject)
		expect(broadcast).not.to.have.been.called
	})

	it('should not broadcast if not passed an object', () => {
		sendMetrics()
		expect(broadcast).not.to.have.been.called
	})

})
