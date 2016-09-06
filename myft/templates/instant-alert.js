import React, { Component } from 'react';
import classNames from 'classnames';
import UpdateMyFtForm from './update-myft-form';

export default class InstantAlert extends Component {
	render () {
		let attrs = Object.assign({}, this.props);
		const isOnText = this.props.buttonText || 'Instant alerts on';
		const isOffText = this.props.alternateText || this.props.buttonText || 'Instant alerts off';
		const instantAttrs = {
			classes: classNames('n-myft-ui--instant', this.props.classes),
			action: '/__myft/api/core/followed/concept/' + this.props.conceptId + '?method=put',
			uiHandle: 'instant',
			ariaPressed: false,
			activateLabel: 'Get instant alerts for ',
			deactivateLabel: 'Stop instant alerts for ',
			buttonText: isOffText,
			alternateText: isOnText,
			btnName: '_rel.instant',
			btnValue: true

		};
		Object.assign(attrs, instantAttrs);
		return <UpdateMyFtForm {...attrs} />
	}
}
