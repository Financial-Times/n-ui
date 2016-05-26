import React, { Component } from 'react';

// convert classes to array by splitting string on ' ', or if already array, just return
const classesToArray = thing => Array.isArray(thing) ? thing : thing.split(' ');

const exists = thing => thing;

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
class Follow extends Component {
	render() {
		let classes = ['n-myft-ui', 'n-myft-ui--follow'];
		if (this.props.classes) {
			classes = classes.concat(classesToArray(this.props.classes));
		}
		const buttonClasses = ['n-myft-ui__button'];
		[this.props.variant, this.props.size]
			.filter(exists)
			.map(buttonOpt => buttonClasses.push(`n-myft-ui__button--${buttonOpt}`));

		return <form
			className={classes.join(' ')}
			method="POST"
			data-myft-ui="follow"
			data-concept-id={this.props.conceptId}
			action={'/__myft/api/core/followed/concept/' + this.props.conceptId + '?method=put'}>
			<input type="hidden" value={this.props.name} name="name" />
			<input type="hidden" value={this.props.taxonomy} name="taxonomy" />
			<button
				aria-label={'Follow ' + this.props.name}
				aria-pressed='false'
				className={buttonClasses.join(' ')}
				data-alternate-label={'Unfollow ' + this.props.name}
				data-alternate-text={this.props.alternateText || this.props.buttonText || 'Following'}
				data-trackable="follow"
				data-concept-id={this.props.conceptId} // duplicated here for tracking
					title={'Follow ' + this.props.name}
				type="submit">
					{this.props.buttonText || 'Follow'}
			</button>
		</form>
	}
}

export default Follow;
