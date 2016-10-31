const React = require('react');
const classNames = require('classnames');
const { Image, helpers } = require('@financial-times/n-image');

module.exports = class TourTip extends React.Component {

	renderTourLink (data) {
		if (data.settings.hasTourPageLink) {
			return React.createElement(
				'p', {className:'tour-tip__link'},
					React.createElement('a', {href:'/tour', className:'tour-tip__link', 'data-trackable':'tour-link', innerText:'New hints and tips'})
			);
		}
	}

	renderBody (data) {
		const createMarkup = (prop) => ({ __html: prop });

		if (data.content.body) {
			return React.createElement('p', {className:'tour-tip__body', dangerouslySetInnerHTML:createMarkup(data.content.body)});
		}
	}

	renderCtas (data) {
		if((!data.content.ctas || !data.content.ctas.length) ||
			(data.settings.isAnon && data.settings.hideCtaFromAnon)) {
			return null;
		}

		return data.content.ctas.map(cta =>
			React.createElement('a', { href:cta.url, className: 'tour-tip__cta o-buttons o-buttons--standout', 'data-trackable': 'cta'}, cta.label)
		);
	}

	renderImage (data) {
		if (data.content.imageUrl) {
			const imageAttrs = {
				alt: data.content.imageAlt,
				classes: ['tour-tip__img'],
				widths: data.content.imageWidths || [],
				sizes: data.content.imageSizes
			};

			//TODO: Make n-image work for images that don't want to specify widths (i.e. SVGs)
			if (data.content.imageWidths) {
				imageAttrs.url = data.content.imageUrl;
			} else {
				imageAttrs.src = helpers.buildImageServiceUrl(data.content.imageUrl);
			}

			return React.createElement(
				'div', {className:'tour-tip__img-container'},
					React.createElement(Image, imageAttrs)
			);
		}
	}

	render () {
		let data = JSON.parse(JSON.stringify(this.props.data));

		if(data.settings.isAnon && data.settings.hideFromAnon) {
			return null;
		}

		const modifiersFromConfig = (data.modifiers || []).map(modifier => `tour-tip--${modifier}`);
		const modifiers = [`tour-tip--${data.settings.size}`, ...modifiersFromConfig];
		const classes = classNames({
			'tour-tip': true
		}, modifiers);

		return React.createElement(
			'div',
			{ className: classes, 'data-trackable': 'tour-tip-' + data.id },
			React.createElement(
				'div',
				{ className: 'tour-tip__main' },
				React.createElement(
					'div',
					{ className: 'tour-tip__text' },
					this.renderTourLink(data),
					React.createElement(
						'h2',
						{ className: 'tour-tip__standout' },
						data.content.title
					),
					this.renderBody(data),
					this.renderCtas(data)
				),
				this.renderImage(data)
			)
		);
	}
};
