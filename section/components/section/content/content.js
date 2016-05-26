import React, { Component } from 'react';
import Components from '../../../';

// assign an incremental id to the Content components
const assignContentId = (contentIndex, component) => {
	if (component.type === 'Content') {
		component.id = contentIndex++;
	} else if (component.components && component.components.length) {
		contentIndex = component.components.reduce(assignContentId, contentIndex);
	}

	return contentIndex;
};

const renderComponents = (id, components, data, { flags = {} }) => components.map((component, index) => {
	const Comp = Components[component.type];
	return <Comp {...component} data={data} key={`${id}_child${index}`} flags={flags} />
});

export default class extends Component {
	render () {
		const data = this.props.data;
		const components = this.props.layout;
		components.reduce(assignContentId, 0);

		return (
			<div className="section__column__inner">
				{renderComponents(this.props.id, components, data, { flags: this.props.flags })}
			</div>
		)
	}
};
