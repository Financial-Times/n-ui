import React, { Component } from 'react';

// convert classes to array by splitting string on ' ', or if already array, just return
const classesToArray = thing => Array.isArray(thing) ? thing : thing.split(' ');

const exists = thing => thing;

/**
 * @param {string} name - Name of the collection
 * @param {string} [variant] - Variant of the button, e.g. `inverse`
 * @param {string} [size] - Size of the button, e.g. `big`
 * @param {Object[]} concepts
 * @param {string} concepts.id
 * @param {string} concepts.name
 * @param {string} concepts.taxonomy
 * @param {(string|Array)} [classes] - Additional class(es) for the follow component
 */
class FollowCollection extends Component {
	render() {
		let classes = ['n-myft-ui', 'n-myft-ui--follow'];
		if (this.props.classes) {
			classes = classes.concat(classesToArray(this.props.classes));
		}
		const buttonClasses = ['n-myft-ui__button'];
		[this.props.variant, this.props.size]
			.filter(exists)
			.map(buttonOpt => buttonClasses.push(`n-myft-ui__button--${buttonOpt}`));

		const conceptIds = this.props.concepts.map(c => c.id).join(',');

		return <form
			className={classes.join(' ')}
			method="POST"
			data-myft-ui="follow"
			data-concept-id={conceptIds}
			action="#">
			<input type="hidden" value={this.props.concepts.map(c => c.taxonomy).join(',')} name="taxonomy" />
			<input type="hidden" value={this.props.concepts.map(c => c.name).join(',')} name="name" />
			<button
				aria-label={'Follow all topics in the ' + this.props.name + ' collection'}
				aria-pressed='false'
				className={buttonClasses.join(' ')}
				data-alternate-label={'Unfollow all topics in the ' + this.props.name + ' collection'}
				data-alternate-text="Following"
				data-trackable="follow"
				data-concept-id={conceptIds} // duplicated here for tracking
					title={'Follow all topics in the ' + this.props.name + ' collection'}
				type="submit">
					Follow all
			</button>
		</form>
	}
}

export default FollowCollection;
