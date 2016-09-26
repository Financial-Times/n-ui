export function negate (func) {
	return (...args) => !func(...args);
}

export function any (callback) {
	return (...values) => values.some(callback)
}

export const anyTrue = any((value) => Boolean(result(value)) === true);
export const noneTrue = negate(anyTrue);

export function result (value) {
	return typeof value === 'function' ? value() : value;
}

export function resultExists (value) {
	return () => {
		const resultValue = result(value);
		return resultValue !== null && resultValue !== undefined;
	}
}

export function executeWhen (func) {
	return (when) => (result(when) || undefined) && func()
}

export function getStorage (key) {
	return () => localStorage.getItem(key);
}

export function getSessionStorage (key) {
	return () => sessionStorage.getItem(key);
}

export function setStorage (key) {
	return (value) => localStorage.setItem(key, result(value));
}

export function getCookie (key) {
	return () => (document.cookie.match(`(^|;)\\s*${key}=([^;]+)`) || [])[2];
}

export function difference (leftValue) {
	return (rightValue) => result(leftValue) - result(rightValue);
}

export function dateInFuture (date) {
	const diffDate = difference(date);
	return () => diffDate(Date.now) > 0;
}

export function addToDate (value) {
	return (date) => new Date(result(date) + result(value));
}

export function element (selector) {
	return () => document.querySelector(selector);
}

export function elementExists (selector) {
	return resultExists(element(selector));
}

export function createElement (tag, attributes, html) {
	const element = document.createElement(tag);
	Object.keys(attributes || {}).forEach((key) => element.setAttribute(key, attributes[key]));
	element.innerHTML = html;
	return element;
}
