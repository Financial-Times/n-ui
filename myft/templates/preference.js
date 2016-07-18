import React, { Component } from 'react';

/**
* React component of the myFT on/off preference toggler
*
* @param {string} preferenceName — The uuid of the Preference in neo4j
* @param {string} buttonText — The button text for core experience/screen-reader users
* @param {Object[]} [relProperties] — Properties to add to the relationship in Neo4j
* @param {string} relProperties[].name — Key of the relationship property
* @param {string} relProperties[].value — Val of the relationship property
* @param {string[]} [variants] — Vary styling of the button via BEM modifiers, e.g. `inverse`
*/
class Preference extends Component {
	render () {

		const relProperties = (this.props.relProperties||[]).map(relProperty => (
			<input type='hidden' name={`_rel.${relProperty.name}`} value={relProperty.value}/>
		));

		const variants = (this.props.variants||[]).map(variant => ` n-ui-myft-cta__button--${variant}`);

		return <form className='myft-ui myft-ui--prefer' method='POST'
			data-myft-ui='prefer'
			data-preference-name={this.props.preferenceName}
			action={`/__myft/api/core/preferred/preference/${this.props.preferenceName}?method=put`}>
			{relProperties}
			<button
				type='submit'
				className={`n-ui-myft-cta__button${variants}`}
				data-trackable={`set-${this.props.preferenceName}`}
			><span className='n-util-visually-hidden'>{this.props.buttonText}</span></button>
		</form>
	}
}

export default Preference;
