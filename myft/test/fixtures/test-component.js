import React, { Component } from 'react';
import Follow from '../../templates/follow';
import Save from '../../templates/save-for-later';

export default class extends Component {
	render () {
		return (
			<div>
				<Follow conceptId="id" name="name" taxonomy="taxonomy" classes="card__tag__follow" />
				<Save contentId="id" classes="safety_first" />
			</div>
		);
	}
}
