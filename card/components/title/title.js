import React, { Component } from 'react';

const liveBlogBadge = status => (
	<span className={`card__live-blog-badge card__live-blog-badge--${status}`}>
		<span className="card__live-blog-badge__text">
			live
		</span>
	</span>
);

const liveBlogStatuses = {
	inprogress: 'in-progress',
	comingsoon: 'coming-soon',
	closed: 'closed'
};

/**
 * @param {string} title
 * @param {string} url
 * @param {string} [liveBlogStatus] - inprogress|commingsoon|closed
 */
export default class extends Component {
	render () {
		const liveBlogStatus = liveBlogStatuses[this.props.liveBlogStatus];

		return (
			<a className="card__title-link" href={this.props.url} data-trackable="main-link">
				{liveBlogStatus ? liveBlogBadge(liveBlogStatus) : null}
				<h3 className="card__title">
					{this.props.title.trim()}
				</h3>
			</a>
		);
	}
}
