import React, { Component } from 'react';
import classNames from 'classnames';

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

export default class UpdateMyFtForm extends Component {
	renderHidden () {
		if (this.props.hidden) {
			return this.props.hidden.map((hidden) => {
				return <input type="hidden" name={hidden.name} value={hidden.value} />
			});
		}
	}
	renderBtnName () {
		return (this.props.btnName && this.props.btnValue) ? this.props.btnName : null;
	}
	renderBtnValue () {
		return (this.props.btnValue) ? this.props.btnValue : null;
	}
	render () {
		const classes = classNames('n-myft-ui', this.props.classes);
		const buttonClasses = ['n-myft-ui__button'];
		[this.props.variant, this.props.size]
			.filter(exists)
			.map(buttonOpt => buttonClasses.push(`n-myft-ui__button--${buttonOpt}`));

		return (
			<form
				className={classes}
				method="POST"
				data-myft-ui={this.props.uiHandle}
				data-concept-id={this.props.conceptId}
				action={this.props.action}>
				<input type="hidden" value={this.props.name} name="name" />
				<input type="hidden" value={this.props.taxonomy} name="taxonomy" />
				{this.renderHidden()}
				<button
					aria-label={this.props.activateLabel + ' ' + this.props.name}
					aria-pressed={this.props.ariaPressed || 'false'}
					className={buttonClasses.join(' ')}
					data-alternate-label={this.props.deactivateLabel + ' ' + this.props.name}
					data-alternate-text={this.props.alternateText || this.props.buttonText}
					data-trackable={this.props.trackable || this.props.uiHandle}
					data-concept-id={this.props.conceptId} // duplicated here for tracking
						title={this.props.activateLabel + this.props.name}
					name={this.renderBtnName()}
					value={this.renderBtnValue()}
					type="submit">
						{this.props.buttonText}
				</button>
				{this.props.alert}
			</form>
		);
	}
}
