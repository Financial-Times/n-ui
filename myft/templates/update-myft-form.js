const React = require('react');
const classNames = require('classnames');

const exists = thing => thing;

// interaction on this class all has to be with 3rd party JS because we must also build a non-React version

/**
* @param {string} conceptId - ID of the concept
* @param {string} name - Name of the concept
* @param {string} taxonomy - Taxonomy of the concept
* @param {string} [variant] - Variant of the button, e.g. `inverse`
* @param {string} [size] - Size of the button, e.g. `big`
* @param {string} [buttonText=Follow] - Text of the button
* @param {string} [alternateText=Following] - Text of the button
* @param {(string|Array)} [classes] - Additional class(es) for the follow component
*/

module.exports = class UpdateMyFtForm extends React.Component {
	renderHidden () {
		if (this.props.hidden) {
			return this.props.hidden.map(({name, value}) => {
				return React.createElement('input', {type:'hidden', name, value})
			});
		}
	}
	renderBtnName () {
		return (typeof this.props.btnName !== 'undefined') ? this.props.btnName : null;
	}
	renderBtnValue () {
		return (typeof this.props.btnValue !== 'undefined') ? this.props.btnValue : null;
	}
	render () {
		const classes = classNames('n-myft-ui', this.props.classes);
		const buttonClasses = ['n-myft-ui__button'];
		[this.props.variant, this.props.size]
			.filter(exists)
			.map(buttonOpt => buttonClasses.push(`n-myft-ui__button--${buttonOpt}`));

		return React.createElement(
				'form',
				{
					className: classes,
					method: 'POST',
					'data-myft-ui': this.props.uiHandle,
					'data-concept-id': this.props.conceptId,
					action: this.props.action },
				React.createElement('input', { type: 'hidden', value: this.props.name, name: 'name' }),
				React.createElement('input', { type: 'hidden', value: this.props.taxonomy, name: 'taxonomy' }),
				this.renderHidden(),
				React.createElement(
					'button',
					{
						'aria-label': this.props.activateLabel + ' ' + this.props.name,
						'aria-pressed': this.props.ariaPressed || 'false',
						className: buttonClasses.join(' '),
						'data-alternate-label': this.props.deactivateLabel + ' ' + this.props.name,
						'data-alternate-text': this.props.alternateText || this.props.buttonText,
						'data-trackable': this.props.trackable || this.props.uiHandle,
						'data-concept-id': this.props.conceptId // duplicated here for tracking
						, title: this.props.activateLabel + this.props.name,
						name: this.renderBtnName(),
						value: this.renderBtnValue(),
						type: 'submit' },
					this.props.buttonText
				),
				this.props.alert
			);
	}
};
