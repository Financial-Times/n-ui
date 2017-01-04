const oViewport = require('o-viewport');
const broadcast = require('../../../utils').broadcast;
const ATTENTION_INTERVAL = 15000;
const ATTENTION_EVENTS = ['load', 'click', 'focus', 'scroll', 'mousemove', 'touchstart', 'touchend', 'touchcancel', 'touchleave'];
const UNATTENTION_EVENTS = ['blur'];
const eventToSend = ('onbeforeunload' in window) ? 'beforeunload' : 'unload';

class Attention {
	constructor () {
		this.totalAttentionTime = 0;
		this.startAttentionTime;
		this.endAttentionTime;
	}

	init () {

		//Add events for all the other Attention events
		for (let i = 0; i < ATTENTION_EVENTS.length; i++) {
			window.addEventListener(ATTENTION_EVENTS[i], ev => this.startAttention(ev));
		}

		for (let i = 0; i < UNATTENTION_EVENTS.length; i++) {
			window.addEventListener(UNATTENTION_EVENTS[i], ev => this.endAttention(ev));
		}

		oViewport.listenTo('visibility');
		document.body.addEventListener('oViewport.visibility', ev => this.handleVisibilityChange(ev), false);

		this.addVideoEvents();

		// Add event to send data on unload
		window.addEventListener(eventToSend, () => {
			this.endAttention();
			broadcast('oTracking.event', {
				category: 'page',
				action: 'interaction',
				context: {
					attention: {
						total: this.totalAttentionTime
					}
				}
			});
		});

	}

	startAttention () {
		clearTimeout(this.attentionTimeout);
		if(!this.startAttentionTime) {
			this.startAttentionTime = (new Date()).getTime();
		}
		this.attentionTimeout = setTimeout(() => this.endAttention(), ATTENTION_INTERVAL);
	}

	startConstantAttention () {
		this.constantAttentionInterval = setInterval(() => this.startAttention(), ATTENTION_INTERVAL);
	}

	endConstantAttention () {
		this.endAttention();
		clearInterval(this.constantAttentionInterval);
	}

	endAttention () {
		if(this.startAttentionTime) {
			this.endAttentionTime = (new Date()).getTime();
			this.totalAttentionTime += Math.round((this.endAttentionTime - this.startAttentionTime)/1000);
			clearTimeout(this.attentionTimeout);
			this.startAttentionTime = null;
		}
	}

	addVideoEvents () {
		this.videoPlayers;
		if (window.FTVideo) {
			this.videoPlayers = document.getElementsByClassName('BrightcoveExperience');
			for (let i = 0; i < this.videoPlayers.length; i++) {
				window.FTVideo.createPlayerAsync(this.videoPlayers[i].id, function (player) {
					player.on(player.MEDIA_PLAY_EVENT, ev => this.startConstantAttention(ev));
					player.on(player.MEDIA_STOP_EVENT, ev => this.endConstantAttention(ev));
				});
			}
		} else {
			this.videoPlayers = document.getElementsByTagName('video');
			for (let i = 0; i < this.videoPlayers.length; i++) {
				this.videoPlayers[i].addEventListener('playing', ev => this.startConstantAttention(ev));
				this.videoPlayers[i].addEventListener('pause', ev => this.endConstantAttention(ev));
				this.videoPlayers[i].addEventListener('ended', ev => this.endConstantAttention(ev));
			}
		}
	}

	handleVisibilityChange (ev) {
		if (ev.detail.hidden) {
			this.endAttention();
		} else {
			this.startAttention();
		}
	}

}

module.exports = Attention;
