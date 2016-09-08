import React, { Component } from 'react';
import classNames from 'classnames';
import UpdateMyFtForm from './update-myft-form';

export default class Follow extends Component {
	render () {
		let attrs = Object.assign({}, this.props);
		const followAttrs = {
			classes: classNames('n-myft-ui--follow', this.props.classes),
			action: '/__myft/api/core/followed/concept/' + this.props.conceptId + '?method=put',
			uiHandle: 'follow',
			activateLabel: 'Add',
			deactivateLabel: 'Remove',
			buttonText: this.props.buttonText || 'Add to myFT',
			alternateText: this.props.alternateText || this.props.buttonText || 'Added'
		};
		Object.assign(attrs, followAttrs);

		return <UpdateMyFtForm {...attrs} />
	}
}
