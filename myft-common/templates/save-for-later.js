import React from 'react';

/**
 * @param {string} contentId
 * @param {boolean} [myFtApiWrite = false]
 * @param {string} [variant]
 * @param {string} [buttonText]
 */

export default ({ contentId, myFtApiWrite, variant, buttonText }) => {
	return myFtApiWrite ? (
		<form className="n-myft-ui n-myft-ui--save" method="POST"
				data-content-id={contentId}
				data-myft-ui="saved"
				action={`/__myft/api/core/saved/content/${contentId}?method=put`}>
			<button
					type="submit"
					className={`n-myft-ui__button${variant ? 'n-myft-ui__button--' + variant : ''}`}
					data-trackable="save-for-later"
					data-alternate-label="Saved to myFT"
					data-alternate-text="Saved"
					data-content-id={contentId}
					aria-label="Save to myFT"
					title="Save to myFT"
			>{buttonText || 'Save'}</button>
		</form>
	) : null;
}
