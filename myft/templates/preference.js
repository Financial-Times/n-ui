import React, { Component } from 'react';

/**
* React component of the myFT on/off preference toggler
*
* @param {string} preferenceName — The uuid of the preference in the database
* @param {string} buttonText — The button text for core experience/screen-reader users
* @param {Object[]} [relProperties] — Properties to add to the relationship in Neo4j
* @param {string} relProperties[].name — Key of the relationship property
* @param {string} relProperties[].value — Val of the relationship property
* @param {string[]} [variants] — Vary styling of the button via BEM modifiers, e.g. `inverse`
* @param {boolean} [enhancedOnly] — For when the preference only works for enhanced users (disabling the button for core)
* @param {string} [info] — An optional message area for dynamic info, or core/enhanced differences
* @param {boolean} [isOn] — Used to reflect the preference’s state in the database
*/
class Preference extends Component {
	render () {

		const relProperties = (this.props.relProperties||[]).map(relProperty => (
			<input type='hidden' name={`_rel.${relProperty.name}`} value={relProperty.value}/>
		));
		const gatewayHttpMethod = (this.props.isOn) ? 'delete' : 'put';
		const variants = (this.props.variants||[]).map(variant => ` myft-ui__button--${variant}`);
		const buttonClasses = ['myft-ui__button', ...variants];

		if (this.props.enhancedOnly) {
			buttonClasses.push('n-util-hide-core');
		}

		//TODO: Make RSS pref its own component to avoid having to commit this sin?
		//typing-dog.gif
		const createMarkup = (prop) => ({__html: prop});

		return <form className={`myft-ui myft-ui--prefer myft-ui--preferred-${this.props.isOn ? 'on' : 'off'}`} method='POST'
			data-myft-ui='prefer'
			data-preference-name={this.props.preferenceName}
			action={`/__myft/api/core/preferred/preference/${this.props.preferenceName}?method=${gatewayHttpMethod}`}>
			{relProperties}
			<p className='myft-ui__info js-myft-ui__info' dangerouslySetInnerHTML={createMarkup(this.props.info)}></p>
			<button
				type='submit'
				className={buttonClasses.join(' ')}
				disabled={this.props.enhancedOnly}
				data-trackable={`set-${this.props.preferenceName}`}
			><span className='n-util-hide-enhanced'>{this.props.buttonText}</span></button>
		</form>
	}
}

export default Preference;
