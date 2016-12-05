const DEFAULT_OPTIONS = {
	domain: location.hostname,
	path: '/',
};

// Regex taken from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie don't ask me how it works
function getRegexForName (name){
	return new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\=\\s*([^;]*).*$)|^.*$`);
}

function getOptions (opts){
	const options = Object.assign({}, DEFAULT_OPTIONS, opts);
	return Object.keys(options).map(key => {
		if(key === 'maxAge'){
			key = 'max-age';
		}

		if(options[key] instanceof Date){
			options[key] = options[key] = options[key].toUTCString();
		}

		return `${key}=${options[key]}`;
	});
}

function set (name, value, opts){
	const options = getOptions(opts).join('; ');
	const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${options}`;
	document.cookie = cookie;
}

function get (name){
	return document.cookie.replace(getRegexForName(name), '$1');
}

function has (name){
	return new RegExp(name + '=').test(document.cookie);
}

function remove (name){
	return set(name, '', {expires:new Date(0)});
}

module.exports = {get, set, has, getRegexForName, remove};
