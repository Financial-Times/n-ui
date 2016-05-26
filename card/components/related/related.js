import React, {Component} from 'react';

import colspan from '../../libs/colspan';
import { responsiveValue, renderClasses } from '../../libs/helpers';
import Timestamp from '../timestamp/timestamp';

/**
 * @param {Object[]) items
 * @param {string) items[].id
 * @param {string) items[].title
 * @param {Object} [show]
 */
export default class extends Component {
	render () {
		const relatedEls = this.props.items.map(item =>
			<li className="card__related-item o-card__related-content-item" key={item.id}>
				<a href={`/content/${item.id}`} className="card__related-item__link" data-trackable="related" >
					{item.title}
				</a>
			</li>
		);
		const dataShow = responsiveValue(this.props.show || { default: true });

		return (
			<ol className="card__related-items o-card__related-content o-grid-row" data-show={dataShow}>
				{relatedEls}
			</ol>
		);
	}
}
