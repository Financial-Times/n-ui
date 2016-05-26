import React, { Component } from 'react';

import SectionMeta from './meta/meta';
import SectionContent from './content/content';
import { colspan, classify } from '../../libs/helpers';

export default class extends Component {
	render () {
		if (this.props.raw) {
			const html = { __html: this.props.raw };
			return <div dangerouslySetInnerHTML={html} />
		};

		//if no content, don't render the section
		if (!this.props.data || Object.keys(this.props.data).every(key => !this.props.data[key] || !this.props.data[key].length)) {
			return null;
		}
		const cols = this.props.cols;
		let trackable = this.props.trackable || this.props.id;
		const sectionClasses = classify([
			'o-grid-row',
			this.props.style ? 'section--' + this.props.style : '',
			this.props.articleRanking ? 'section--article-ranking' : ''
		]);
		const sectionContentClasses = classify([
			'section__column',
			'section__column--content',
			this.props.isTab ? 'o-tabs__tabpanel' : ''
		]);
		const sectionMetaClasses = classify([
			'section__column',
			'section__column--meta',
			this.props.cols.meta && this.props.cols.meta.hide ? 'n-util-visually-hidden' : ''
		]);

		if (this.props.followButton) {
			this.props.followButton.classes = (this.props.followButton.classes || '').concat(' section-meta__follow ');
		}

		return (
			<section className={sectionClasses} data-trackable={trackable}>
				{
					cols.meta ?
						<div data-o-grid-colspan={colspan(cols.meta)} className={sectionMetaClasses}>
							<SectionMeta title={this.props.title} followButton={this.props.followButton} />
						</div> :
						null
				}
				<div
					id={`${this.props.id}-section-content`}
					data-o-grid-colspan={colspan(cols.content)}
					className={sectionContentClasses}>
					<SectionContent
						id={this.props.id}
						style={this.props.style}
						layout={this.props.layout}
						data={this.props.data}
						flags={this.props.flags}
					/>
				</div>
			</section>
		);
	}
};
