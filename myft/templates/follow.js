const React = require('preact');
const classNames = require('classnames');
const UpdateMyFtForm = require('./update-myft-form');

module.exports = class Follow extends React.Component {
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
		return React.createElement(UpdateMyFtForm, attrs);
	}
};
