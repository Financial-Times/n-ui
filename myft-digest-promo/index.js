const myFtClient = require('next-myft-client');
const buttons = require('../buttons');
const superstore = require('superstore-sync');
const STORAGE_KEY = 'n-myft-digest-promo-seen';

const CLASSES = {
  ctaBtn: '.n-myft-digest-promo__cta-btn',
  dismissBtn: '.n-myft-digest-promo__dismiss-btn',
  promoComponent: '.n-myft-digest-promo',
  promoEnabled: 'n-myft-digest-promo--enabled'
};

console.log(CLASSES);

let btn, conceptId;

function bindListeners() {
  const btn = document.querySelector(CLASSES.ctaBtn);
  const dismissBtn = document.querySelector(CLASSES.dismissBtn);

  btn.addEventListener('click', addToDigest, false);
  dismissBtn.addEventListener('click', () => {
    hidePromo();
    setDismissState();
  }, false);
}

function shouldShowPromo(conceptId) {
  return Promise.all([
    myFtClient.get('followed', 'concept', conceptId),
    myFtClient.get('preferred', 'preference', 'email-digest')
  ]).then(values => {
    return values[0].length === 0 && values[1].length === 0 && !getDismissState();
    console.log(values);
  });
}

function showPromo() {
  const element = document.querySelector(CLASSES.promoComponent);
  console.log(element);
  element.classList.add(CLASSES.promoEnabled);
}

function hidePromo() {
  const element = document.querySelector(CLASSES.promoComponent);
  element.classList.remove(CLASSES.promoEnabled);
}

function getDismissState() {
  return superstore.local.get(STORAGE_KEY);
}

function setDismissState() {
  superstore.local.set(STORAGE_KEY, 1);
}

function addToDigest(event) {
  const metaConcept = {
    name: btn.getAttribute('data-title'),
    taxonomy: btn.getAttribute('data-taxonomy')
  };
  const metaEmail = {
    _rel: {
      type: "daily",
      timezone: "Europe/London"
    }
  };

  return Promise.all([
    myFtClient.add('user', null, 'followed', 'concept', conceptId, metaConcept),
    myFtClient.add('user', null, 'preferred', 'preference', 'email-digest', metaEmail)
  ]).then(values => {
    buttons.toggleState(btn, true);
    btn.setAttribute('disabled', true);
  });
}

function init() {
  console.log("init func runs");
  if(!superstore.isPersisting()) { return; }
  console.log("superstore persisting");
  btn = document.querySelector(CLASSES.ctaBtn);
  conceptId = btn.getAttribute('data-concept-id');
  shouldShowPromo(conceptId).then(shouldShow => {
    if(shouldShow) {
      console.log("shouldShow = true");
      showPromo();
      bindListeners();
    }
  });
};

module.exports = { init };
