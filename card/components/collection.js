import React, { Component } from 'react';
import FollowCollection from '../../myft/templates/follow-collection';

import { responsiveValue } from '../libs/helpers';

const createFollowComponentAttrs = (concepts, name, isFollowing) => ({
	concepts,
	name,
	isFollowing,
	classes: 'card__collection-follow',
	buttonText: 'Follow All',
	alternateText: 'Following'
});

/**
 * @param {string} title
 * @param {boolean} [isFollowing=false]
 * @param {number} articleCount
 * @param {Object[]} concepts
 * @param {string} concepts.name
 */
export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			empty: props.isEmpty
		};
	}

	likeCollections() {
		this.setState({liked: true});
	}

	render () {
		const classes = ['card', 'card--collection', 'o-card'];
		if(this.state.empty) classes.push('card--empty');
		const attrs = {
			className: classes.join(' '),
			'data-trackable': 'collection',
			'aria-label': this.props.name
		};
		if (this.props.show) {
			attrs['data-show'] = responsiveValue(this.props.show);
		}

		const concepts = this.props.concepts.map(concept => (
			<li className='card__collection-concept'>
				<a
					className='card__collection-concept-link'
					href={concept.url}
					data-trackable='concept'>{concept.name}</a>
			</li>
		));

		const feedback = (this.state.liked) ? (
			<div className='card__collection-feedback is-given'>
				<p>Thanks for your feedback</p>
			</div>
		) : (
			<div className='card__collection-feedback'>
				<p>We are currently trialling topic collections</p>
				<p>Let us know what you think</p>
				<button className='card__collection-more-button n-myft-ui__button'
				        aria-label='I like collections'
				        title='I like collections'
				        aria-pressed='false'
				        data-trackable='more-collections'
				        onClick={this.likeCollections.bind(this)}
					>I like collections</button>
				<p>or email us: <a className='card__collection-feedback-email' href='mailto:next.feedback@ft.com?Subject=myFT%20Topic%20Collections' data-trackable='more-collections-email'>next.feedback@ft.com</a></p>
			</div>
		);

		if(this.state.empty) {
			return (
				<section {...attrs}>
					<header className='card__collection-header'>
						<h3 className='card__collection-title'>Want more?</h3>
					</header>
					{feedback}
				</section>
			);

		} else {
			return (
				<section {...attrs}>
					<header className='card__collection-header'>
						<h3 className='card__collection-title'>
							{this.props.title}
						</h3>
					</header>
					<h4 className='card__collection-sub-heading'>Topics included:</h4>
					<ul className='card__collection-concepts'>
						{concepts}
					</ul>
					<h4 className='n-util-visually-hidden'>Actions and more information</h4>
					<div className='card__collection-meta'>
						<div className='card__collection-datum'>{concepts.length}<br/>topics</div>
						<FollowCollection {...createFollowComponentAttrs(
							this.props.concepts,
							this.props.title,
							false
						)} />
					</div>
				</section>
			);
		}


	}
}
