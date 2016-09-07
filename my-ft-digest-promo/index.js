const myFtClient = require('next-myft-client');
const buttons = require('../buttons');
let btn;

function init(){
  console.log("Hello World");
  btn = document.querySelector(".n-myft-digest-promo__cta-btn");
  const conceptId = btn.getAttribute('data-concept-id');
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

  shouldShowPromo(conceptId).then(shouldShow => {
    console.log('SHOULD SHOW PROMO', shouldShow);
    if(shouldShow) {
      showPromo();
      btn.addEventListener('click', function(){
        addToDigest(conceptId, metaConcept, metaEmail);
      }, false);
    }
  });
};

function shouldShowPromo(conceptId) {
  return Promise.all([
    myFtClient.get('followed', 'concept', conceptId),
    myFtClient.get('preferred', 'preference', 'email-digest')
  ]).then(values => {
    console.log('MYFT DATA', values);
    return values[0].length === 0 && values[1].length === 0;
  });
}

function showPromo() {
  const element = document.querySelector(".n-myft-digest-promo");
  element.classList.add("n-myft-digest-promo--enabled");
}

function addToDigest(conceptId, metaConcept, metaEmail) {
  console.log('CLICKED', metaConcept, metaEmail);
  return Promise.all([
    myFtClient.add('user', null, 'followed', 'concept', conceptId, metaConcept),
    myFtClient.add('user', null, 'preferred', 'preference', 'email-digest', metaEmail)
  ]).then(values => {
    console.log('values:', values);
    buttons.toggleState(btn, true);
    btn.setAttribute('disabled', true);
    console.log(btn.getAttribute('disabled'));
    //supress confirm-subscribed overlay
  }).catch(err => {
    console.log(err);
  });
}

module.exports = { init };
