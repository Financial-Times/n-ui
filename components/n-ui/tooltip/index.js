const ID_ATTRIBUTE = 'data-n-tooltip-id';

const TOOLTIP_CLASS = 'n-tooltip';
const TOOLTIP_VISIBLE_CLASS = TOOLTIP_CLASS+'--visible';
const TOOLTIP_CLOSE_CLASS = TOOLTIP_CLASS+'__close';
const TOOLTIP_HIDDEN_CLASS = TOOLTIP_CLASS+'--hidden';
const LEFT_TAIL_CLASS = TOOLTIP_CLASS+'--left-tail';

let tooltipCount = 0;

const DEFAULT_OPTIONS = {
	content: '',
	showMode : 'hover'
};

function generateId (){
	tooltipCount++;
	return `ft-n-tooltip_${tooltipCount}`;
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
		this._position = this.position.bind(this);
		if(this.options.showMode === 'load'){
			setTimeout(() => this.show(), 2000);
		}
		this.tooltip.addEventListener(this.transitionEndEvent, this.onTransitionEnd.bind(this));
	}

	get transitionEndEvent (){
		if(!this._transitionEndEvent){
			const el = document.createElement('fakeelement');
			const transitions = {
				'transition':'transitionend',
				'OTransition':'oTransitionEnd',
				'MozTransition':'transitionend',
				'WebkitTransition':'webkitTransitionEnd'
			};
			Object.keys(transitions).forEach(t => {
				if(el.style[t] !== undefined){
					this._transitionEndEvent = transitions[t];
				}
			})
		}

		return this._transitionEndEvent;
	}

	show (){
		this.tooltip.classList.remove(TOOLTIP_HIDDEN_CLASS);
		this.position();
		window.addEventListener('resize', this._position);
		this.tooltip.classList.add(TOOLTIP_VISIBLE_CLASS);
	}

	hide () {
		this.tooltip.classList.remove(TOOLTIP_VISIBLE_CLASS);
		window.removeEventListener('resize', this._position);
	}

	position (){
		const elRect = this.el.getClientRects()[0];
		const parentRect = this.el.offsetParent.getClientRects()[0];
		let left = (elRect.left - parentRect.left) + (elRect.width / 2) - (this.tooltip.offsetWidth / 2);
		// the magic 15 is to account for the triangle
		let top = (this.el.offsetTop + this.el.clientHeight + 15);
		if(left < 20){
			left = 0;
			this.tooltip.classList.add(LEFT_TAIL_CLASS);
		}else{
			this.el.classList.remove(LEFT_TAIL_CLASS);
		}

		this.tooltip.style.top = top + 'px';
		this.tooltip.style.left = left + 'px';
	}

	onTransitionEnd (){
		if(!this.tooltip.classList.contains(TOOLTIP_VISIBLE_CLASS)){
			this.tooltip.classList.add(TOOLTIP_HIDDEN_CLASS);
		}
	}
}
