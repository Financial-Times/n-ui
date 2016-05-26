import React, { Component } from 'react';
import Components from '../../';

export default class extends Component {
	render () {
		if (!this.props.components) {
			return null;
		}

		const renderComponents = (components, { flags = {} }) => components.map((component, index) => {
			const Comp = Components[component.type];
			return <Comp {...component} data={this.props.data} key={`row-child_${index}`} flags={flags} />
		});

		return (
			<div className="o-grid-row">
				{renderComponents(this.props.components, { flags: this.props.flags })}
			</div>
		);
	}
};
