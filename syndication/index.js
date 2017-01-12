import {$$, $, cookieStore} from '../utils';

const USER_PRODUCTS_SERVICE_URL = 'https://session-next.ft.com/products';
const SYNDICATION_PRODUCT_CODE = 'S1';
const SYNDICATION_USER_ATTR = 'data-syndication-user';
const SYNDICATION_LINK_CLASS = 'o-teaser__syndication-indicator';

const createSyndicationLink = uuid => {
	const a = document.createElement('a');
	a.href = `http://ftsyndication.com/redirect.php?uuid=${uuid}`;
	a.target = '_blank';
	a.classList.add(SYNDICATION_LINK_CLASS);
	a.innerHTML = '<span>Download Article (opens in a new window)</span>';
	return a;
};

function checkIfUserisSyndicationCustomer (){
	const user = cookieStore.user();
	if(user){
		return Promise.resolve(user.products().includes('S1'));
	}

	return fetch(USER_PRODUCTS_SERVICE_URL, {credentials:'include'})
		.then(response => {
			if(!response.ok){
				throw new Error(`${USER_PRODUCTS_SERVICE_URL} returned ${response.status} ${response.statusText}`);
			}else{
				return response.json();
			}
		})
		.then(json => {
			return (json.products && json.products.includes(SYNDICATION_PRODUCT_CODE));
		})
}

function updateTeasers (teasers){
	teasers.forEach(updateTeaser);
}

function updateTeaser(teaser){
	const heading = teaser.querySelector('.o-teaser__heading');

	if(heading.querySelector('.'+SYNDICATION_LINK_CLASS)){
		return;
	}
	const link = heading.querySelector('a');
	const uuid = link.pathname.replace('/content/', '');
	heading.insertBefore(createSyndicationLink(uuid), link);
}

function updateMainArticle (article){
	const container = article.querySelector('.article-headline');
	const title = container.querySelector('.article-classifier__gap');
	const uuid = article.getAttribute('data-content-id');
	container.insertBefore(createSyndicationLink(uuid), title);
}

function onAsyncContentLoaded(){
	const syndicatableTeasers = $$('.o-teaser--syndicatable');
	updateTeasers(syndicatableTeasers);
}

export function init (flags){
	if(!flags.get('syndication')){
		return;
	}

	const syndicatableTeasers = $$('.o-teaser--syndicatable');
	const syndicatableMainArticle = $('.article[data-syndicatable="yes"]');

	if(!syndicatableTeasers.length && !syndicatableMainArticle){
		return;
	}

	document.body.addEventListener('asyncContentLoaded', onAsyncContentLoaded);

	checkIfUserisSyndicationCustomer()
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
