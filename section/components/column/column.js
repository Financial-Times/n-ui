import React, { Component } from 'react';
import { colspan, renderClasses } from '../../libs/helpers';
import Components from '../../';

export default class extends Component {
	render () {
		if (!this.props.components) {
			return null;
		}
		const classes = {
			column: true,
			'column--related': this.props.isRelated
		};

		const renderComponents = (components, { flags = {} }) => components.map((component, index) => {
			const Comp = Components[component.type];
			return <Comp {...component} data={this.props.data} key={`column-child_${index}`} flags={flags} />
		});

		return (
			<div className={renderClasses(classes)} data-o-grid-colspan={colspan(this.props.colspan)}>
				{renderComponents(this.props.components, { flags: this.props.flags })}
			</div>
		);
	}
};
