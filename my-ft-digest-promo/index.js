const myFtClient = require('next-myft-client');


function shouldShowPromo(conceptId) {
  return Promise.all([
    myFtClient.get('followed', 'concept', conceptId),
    myFtClient.get('preferred', 'preference', 'email-digest')
  ]).then(values => {
    return values[0].length === 0 && values[1].length === 0;
  });
}

function showPromo() {
  const element = document.querySelector(".n-myft-digest-promo");
  element.classList.add("n-myft-digest-promo--enabled");
}

function addToDigest() {
  console.log('CLICKED');

}

function init(){
  const btn = document.querySelector(".n-myft-digest-promo__cta-btn");
  const conceptId = btn.getAttribute('data-concept-id')

  shouldShowPromo(conceptId).then(shouldShow => {
    if(shouldShow) {
      showPromo();
      btn.addEventListener('click', addToDigest);
    }
  });
};

module.exports = { init };

//init function - check for signed in status & digest preference status
//then display css (add the class to the promo)
//poss use jQuery $("n-myft-digest-promo").addClass("n-myft-digest-promo--enabled");
//set up button event handlers

//onclick listener - send put requests to two routes using next-myft-client
//then change button status
