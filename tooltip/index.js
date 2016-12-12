const ID_ATTRIBUTE = 'data-n-tooltip-id';

const TOOLTIP_CLASS = 'n-tooltip';
const TOOLTIP_VISIBLE_CLASS = TOOLTIP_CLASS+'--visible';
const TOOLTIP_CLOSE_CLASS = TOOLTIP_CLASS+'__close';
const TOOLTIP_HIDDEN_CLASS = TOOLTIP_CLASS+'--hidden';

const ANIM_LENGTH = 250;

let tooltipCount = 0;

const DEFAULT_OPTIONS = {
	content: '',
	showMode : 'hover'
};

function generateId (){
	tooltipCount++;
	return `ft-n-tooltip_+${tooltipCount}`;
}

function generateHTML (content){
	const closeLink = document.createElement('a');
	closeLink.classList.add(TOOLTIP_CLOSE_CLASS);
	const div = document.createElement('div');
	div.id = generateId();
	div.classList.add(TOOLTIP_CLASS);
	div.classList.add(TOOLTIP_HIDDEN_CLASS);
	div.innerHTML = content;
	div.appendChild(closeLink);
	return div;
}

export class NToolTip{

	constructor (el, opts = {}){
		this.el = el;
		this.options = Object.assign({}, DEFAULT_OPTIONS, opts);
		this.tooltip = generateHTML(this.options.content);
		this.el.setAttribute(ID_ATTRIBUTE, this.tooltip.id);
		this.el.parentNode.insertBefore(this.tooltip, this.el.nextElementSibling);
		this.tooltip.querySelector('.'+TOOLTIP_CLOSE_CLASS).addEventListener('click', this.hide.bind(this));
		if(this.options.showMode === 'load'){
			this.show();
		}
	}

	show (){
		this.tooltip.classList.remove(TOOLTIP_HIDDEN_CLASS);
		this.position();
		this.tooltip.classList.add(TOOLTIP_VISIBLE_CLASS);
	}

	hide () {
		this.tooltip.classList.remove(TOOLTIP_VISIBLE_CLASS);
		setTimeout(() => {
			this.tooltip.classList.add(TOOLTIP_HIDDEN_CLASS);
		}, ANIM_LENGTH);
	}

	position (){
		this.tooltip.style.left = (this.el.offsetLeft - (this.tooltip.offsetWidth / 2)) + 'px';

		// the magic 15 is to account for the triangle
		this.tooltip.style.top = (this.el.offsetTop + this.el.clientHeight + 15) + 'px';
	}
}
