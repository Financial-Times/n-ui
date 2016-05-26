import React from 'react';
import ReactDOM from 'react-dom';

import * as cards from '../main';

const articleCardPropsBase = {
	title: 'GSK to relax intellectual property rules to help developing world',
	id: '903cc52e-f729-11e5-803c-d27c7117d132',
	size: 'medium',
	published: '2016-03-31T15:21:43Z',
	lastPublished: '2016-03-31T11:48:47Z',
	standfirst: {
		show: { default: true },
		text: 'Proposals will allow manufacturers to produce low-cost generic drugs without risk of legal challenge'
	},
	tag: {
		name: 'Pharmaceuticals',
		taxonomy: 'sections',
		url: '/stream/sectionsId/NTI=-U2VjdGlvbnM='
	},
	image: {
		url: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/b4555454-b533-11e5-b147-e5e5bba42e51',
		widths: [100, 500],
		sizes: { default: '200px', M: '500px' }
	}
};

['top', 'bottom', 'left', 'right'].forEach(position => {
	const props = Object.assign({}, articleCardPropsBase);
	props.image.position = { default: position };
	ReactDOM.render(<cards.ArticleCard {...props} />, document.getElementById(`article-card-image-${position}`));
});

const brandCardPropsBase = {
	title: 'Ten rules for composing your LinkedIn summary',
	id: '39e61cae-f5a1-11e5-803c-d27c7117d132',
	size: 'medium',
	published: '2016-04-03T12:37:54Z',
	lastPublished: '2016-04-03T12:37:54Z',
	standfirst: {
		show: { default: true },
		text: 'Hillary Clinton\'s summary teaches two lessons in how not to do it: no jokes and stick to the point'
	},
	image: {
		url: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/87fa0458-f800-11e5-96db-fc683b5e52db',
		widths: [100, 500],
		sizes: { default: '200px', M: '500px' }
	},
	type: 'opinion'
};

[
	{
		id: 'opinion-card',
		type: 'opinion',
		brandProps: {
			title: 'Mark Tluszcz',
			url: '/stream/authorsId/ODk2NDIyNjgtMjkwZS00OTgxLWFjODctZDZlNGY3M2QwYWU4-QXV0aG9ycw==',
			type: 'opinion'
		}
	},
	{
		id: 'opinion-card-headshot',
		type: 'opinion',
		brandProps: {
			title: 'Lucy Kellaway',
			url: '/stream/authorsId/Q0ItMDAwMDkyNg==-QXV0aG9ycw==',
			type: 'opinion',
			headshot: 'https://next-geebee.ft.com/image/v1/images/raw/fthead:lucy-kellaway'
		}
	},
	{
		id: 'editors-pick-card',
		type: 'editors-pick',
		brandProps: {
			title: 'Editor\'s Pick',
			type: 'editors-pick'
		}
	}
].forEach(config => {
	const props = Object.assign({}, brandCardPropsBase, { brand: config.brandProps });
	props.type = config.type;
	ReactDOM.render(<cards.ArticleCard {...props} />, document.getElementById(config.id));
});
