import {$$, $} from 'n-ui-foundations';
import {products as getUserProducts, uuid as getUuid} from 'next-session-client';
import newSyndicators from './new-synders';

const SYNDICATION_PRODUCT_CODE = 'S1';
const SYNDICATION_USER_ATTR = 'data-syndication-user';
const SYNDICATION_LINK_CLASS = 'o-teaser__syndication-indicator';
const TEASER_SELECTOR = '.o-teaser--syndicatable, .o-teaser--not-syndicatable';

const downloadableFormats = [
	{
		type: 'html',
		name: 'HTML'
	},
	{
		type: 'docx',
		name: 'Word doc'
	},
	{
		type: 'plain',
		name: 'plain text'
	}
];

const createSyndicationLinkOld = (uuid, title, syndicationStatus) => {
	const a = document.createElement('a');
	a.href = `http://ftsyndication.com/redirect.php?uuid=${uuid}`;
	a.target = '_blank';
	a.rel = 'noopener';
	a.classList.add(SYNDICATION_LINK_CLASS);
	a.classList.add(SYNDICATION_LINK_CLASS+'--'+syndicationStatus);
	a.innerHTML = `<span>Download “${title || 'article'}” (opens in a new window)</span>`;
	return a;
};

const createSyndiLinkNew = (data) => (`
	<a href="https://ft-rss.herokuapp.com/content/${data.uuid}?format=${data.format.type}&download=true" class="syndi__link n-skip-link" data-trackable="download-${data.format.type}">Download <span class="n-util-visually-hidden">${data.title} </span>as ${data.format.name}</a>
`);

const createSyndiOverlay = (data) => {
	const syndiLinks = downloadableFormats.map(format => createSyndiLinkNew(Object.assign({}, data, { format })));
	return `
		<div class="syndi__download-options">
			${syndiLinks.join('\n\t')}
		</div>
	`;
};

const createSyndicatorNew = (uuid, title, syndicationStatus) => {
	const container = document.createElement('div');

	container.className = [
		SYNDICATION_LINK_CLASS,
		`${SYNDICATION_LINK_CLASS}--${syndicationStatus}`,
		'syndi'
	].join(' ');
	container.setAttribute('data-trackable', 'syndication');
	container.innerHTML = createSyndiOverlay({ uuid, title });

	return container;
};

function checkIfUserIsSyndicationCustomer () {
	let userIsSyndicationCustomer = false;
	return getUserProducts()
		.then(response => {
			if (response && response.products) {
				userIsSyndicationCustomer = response.products.includes(SYNDICATION_PRODUCT_CODE);
			}
		})
		.catch(err => err)
		.then(() => userIsSyndicationCustomer);
}

function updateTeasers (teasers, createSyndicator){
	teasers.forEach(teaser => updateTeaser(teaser, createSyndicator));
}

function updateTeaser (teaser, createSyndicator){
	const syndicationStatus = teaser.classList.contains('o-teaser--syndicatable') ? 'yes' : 'no';
	const heading = teaser.querySelector('.o-teaser__heading');
	if(heading.querySelector('.'+SYNDICATION_LINK_CLASS)){
		return;
	}
	const link = heading.querySelector('a');
	const uuid = link.pathname.replace('/content/', '');
	const title = link.textContent;
	heading.insertBefore(createSyndicator(uuid, title, syndicationStatus), link);
}

function updateMainArticle (article, createSyndicator){
	const syndicationStatus = article.getAttribute('data-syndicatable');
	const container = article.querySelector('.article-headline');
	const title = container.querySelector('.article-classifier__gap');
	const uuid = article.getAttribute('data-content-id');
	container.insertBefore(createSyndicator(uuid, title, syndicationStatus), title);
}

function onAsyncContentLoaded (createSyndicator){
	const syndicatableTeasers = $$(TEASER_SELECTOR);
	updateTeasers(syndicatableTeasers, createSyndicator);
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

	//TODO: refactor this pyramid away
	checkIfUserIsSyndicationCustomer()
		.then(userIsSyndicationCustomer => {
			if(!userIsSyndicationCustomer){
				return;
			}

			document.body.setAttribute(SYNDICATION_USER_ATTR, 'true');

			let shouldUseNewSyndication = false;

			getUuid().then(({uuid} = {}) => {
				shouldUseNewSyndication = (flags.get('syndicationNew') && newSyndicators.includes(uuid)) || flags.get('syndicationNewOverride');
			})
			.catch(err => err) // Show old syndicator if anything goes wrong
			.then(() => {
				const createSyndicator = (shouldUseNewSyndication) ? createSyndicatorNew : createSyndicationLinkOld;

				document.body.addEventListener('asyncContentLoaded', () => onAsyncContentLoaded(createSyndicator));

				if(syndicatableTeasers.length){
					updateTeasers(syndicatableTeasers, createSyndicator);
				}

				if(syndicatableMainArticle){
					updateMainArticle(syndicatableMainArticle, createSyndicator);
				}
			});
		});
}
