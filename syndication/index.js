import {$$, $} from 'n-ui-foundations';

import {products as getUserProducts} from 'next-session-client';
const SYNDICATION_PRODUCT_CODE = 'S1';
const SYNDICATION_USER_ATTR = 'data-syndication-user';
const SYNDICATION_LINK_CLASS = 'o-teaser__syndication-indicator';
const TEASER_SELECTOR = '.o-teaser--syndicatable, .o-teaser--not-syndicatable';

const createSyndicationLink = (uuid, syndicationStatus) => {
	const a = document.createElement('a');
	a.href = `http://ftsyndication.com/redirect.php?uuid=${uuid}`;
	a.target = '_blank';
	a.classList.add(SYNDICATION_LINK_CLASS);
	a.classList.add(SYNDICATION_LINK_CLASS+'--'+syndicationStatus);
	a.innerHTML = '<span>Download Article (opens in a new window)</span>';
	return a;
};

function checkIfUserIsSyndicationCustomer (){
	return getUserProducts()
		.then(response => {
			if(!response || !response.products){
				return false;
			}else{
				return response.products.includes(SYNDICATION_PRODUCT_CODE);
			}
		}).catch(() => {
			return false;
	});
}

function updateTeasers (teasers){
	teasers.forEach(updateTeaser);
}

function updateTeaser (teaser){
	const syndicationStatus = teaser.classList.contains('o-teaser--syndicatable') ? 'yes' : 'no';
	const heading = teaser.querySelector('.o-teaser__heading');
	if(heading.querySelector('.'+SYNDICATION_LINK_CLASS)){
		return;
	}
	const link = heading.querySelector('a');
	const uuid = link.pathname.replace('/content/', '');
	heading.insertBefore(createSyndicationLink(uuid, syndicationStatus), link);
}

function updateMainArticle (article){
	const syndicationStatus = article.getAttribute('data-syndicatable');
	const container = article.querySelector('.article-headline');
	const title = container.querySelector('.article-classifier__gap');
	const uuid = article.getAttribute('data-content-id');
	container.insertBefore(createSyndicationLink(uuid, syndicationStatus), title);
}

function onAsyncContentLoaded (){
	const syndicatableTeasers = $$(TEASER_SELECTOR);
	updateTeasers(syndicatableTeasers);
}

export function init (flags){
	if(!flags.get('syndication')){
		return;
	}

	const syndicatableTeasers = $$(TEASER_SELECTOR);
	const syndicatableMainArticle = $('.article[data-syndicatable]');

	if(!syndicatableTeasers.length && !syndicatableMainArticle){
		return;
	}

	document.body.addEventListener('asyncContentLoaded', onAsyncContentLoaded);

	checkIfUserIsSyndicationCustomer()
		.then(userIsSyndicationCustomer => {
			if(!userIsSyndicationCustomer){
				return;
			}

			document.body.setAttribute(SYNDICATION_USER_ATTR, 'true');
			if(syndicatableTeasers.length){
				updateTeasers(syndicatableTeasers);
			}

			if(syndicatableMainArticle){
				updateMainArticle(syndicatableMainArticle);
			}
		});
}
