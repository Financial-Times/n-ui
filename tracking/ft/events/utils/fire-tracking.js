export default (name, data, el = document.body) => {
	const event = (() => {
		try {
			return new CustomEvent(name, { bubbles: true, cancelable: true, detail: data });
		} catch (e) {
			return CustomEvent.initCustomEvent(name, true, true, data);
		}
	})();
	el.dispatchEvent(event);
}
