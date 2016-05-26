import ODate from 'o-date';
import React, { Component } from 'react';

const liveBlogStatusConfig = {
	inprogress: {
		id: 'in-progress',
		text: 'last post'
	},
	comingsoon: {
		id: 'coming-soon',
		text: 'coming soon'
	},
	closed: {
		id: 'closed',
		text: 'liveblog closed'
	}
};

const capitalise = string => string.slice(0, 1).toUpperCase() + string.slice(1);

/**
 * @param {string} [date] - iso8601
 * @param {string} [liveBlogStatus] - inprogress|commingsoon|closed
 * @param {string} [state] - new|updated
 */
export default class extends Component {
	constructor (props) {
		super(props);
		this.state = {
			dateText: ODate.format(props.date, 'datetime'),
			title: ODate.format(props.date, 'datetime')
		};
		this.possibleStates = ['new', 'updated'];
	}

	// not called on the initial render, e.g. client only code
	componentWillReceiveProps (props) {
		this.setState({
			dateText: ODate.ftTime(new Date(props.date))
		});
	}

	render () {
		const liveBlogStatus = liveBlogStatusConfig[this.props.liveBlogStatus];
		const state = this.possibleStates.includes(this.props.state) ? this.props.state : null;
		const classes = ['card__timestamp'];
		let prefix = null;

		if (state) {
			classes.push(`card__timestamp--${state}`);
			prefix = capitalise(state);
		} else if (liveBlogStatus) {
			classes.push('card__timestamp--live-blog', `card__timestamp--${liveBlogStatus.id}`);
			prefix = liveBlogStatus.text;
		}

		return (
			<div className={classes.join(' ')}>
				{
					prefix ?
						<span className="card__timestamp__prefix">
							<span className="card__timestamp__prefix__icon" />
							{prefix}
						</span> :
						null
				}
				{
					this.props.date ?
						<time className="card__timestamp__time" data-o-component="o-date" title={this.state.title} dateTime={this.props.date}>
							{this.state.dateText}
						</time> :
						null
				}
			</div>
		);
	}
}
