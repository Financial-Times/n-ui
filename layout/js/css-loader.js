/*eslint-disable*/
/*
The MIT License (MIT)

Copyright (c) 2014 Filament Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// Based on https://github.com/filamentgroup/loadCSS,
// but significantly altered to provide a 'MainCssLoaded' event to our javascript
(function () {
	var w = window;
	var doc = document;
	var preloadSupported = (function () {
		try {
			return doc.createElement( "link" ).relList.supports( "preload" );
		} catch (e) {
			return false;
		}
	})();

	function onloadCSS( ss, callback ) {
		var called;

		function newcb(){
			if (!called && callback ){
				called = true;
				callback.call( ss );
			}
		}
		if( ss.addEventListener ){
			ss.addEventListener( "load", newcb );
		}
		if( ss.attachEvent ){
			ss.attachEvent( "onload", newcb );
		}

		// This code is for Android < 4.4 - No support for onload (it'll bind but never fire):
		if( "isApplicationInstalled" in navigator && "onloadcssdefined" in ss ) {
			ss.onloadcssdefined( newcb );
		}
	}

	w.loadCSS = function ( href, before, media ){
		var ss = doc.createElement( "link" );
		var ref;
		if( before ){
			ref = before;
		}
		else {
			var refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
			ref = refs[ refs.length - 1];
		}

		var sheets = doc.styleSheets;
		ss.rel = "stylesheet";
		ss.href = href;
		// temporarily set media to something inapplicable to ensure it'll fetch without blocking render
		ss.media = "only x";

		// wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
		function ready( cb ){
			if( doc.body ){
				return cb();
			}
			setTimeout(function(){
				ready( cb );
			});
		}
		// Inject link
			// Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
			// Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
		ready( function(){
			ref.parentNode.insertBefore( ss, ( before ? ref : ref.nextSibling ) );
		});

		// A method (exposed on return object for external use) that mimics onload by polling until document.styleSheets until it includes the new sheet.
		var onloadcssdefined = function( cb ){
			var resolvedHref = ss.href;
			var i = sheets.length;
			while( i-- ){
				if( sheets[ i ].href === resolvedHref ){
					return cb();
				}
			}
			setTimeout(function() {
				onloadcssdefined( cb );
			});
		};

		function loadCB(){
			if( ss.addEventListener ){
				ss.removeEventListener( "load", loadCB );
			}
			ss.media = media || "all";
		}

		// once loaded, set link's media back to `all` so that the stylesheet applies once it loads
		if( ss.addEventListener ){
			ss.addEventListener( "load", loadCB);
		}
		ss.onloadcssdefined = onloadcssdefined;
		onloadcssdefined( loadCB );
		return ss;
	};

	var allLinks = doc.getElementsByTagName( "link" );
	var link, newLink;
	for (var i = 0; i < allLinks.length; i++) {
		link = allLinks[i];
		if (link.rel === "preload" && link.getAttribute( "as" ) === "style") {
			if (preloadSupported) {
				onloadCSS(link, function () {
					this.rel = "stylesheet";
					if (/\/.*\/main\.css/.test(this.href)) {
						w.ftNextFireCondition('MainCssLoaded');
					}
				});
			} else {
				newLink = w.loadCSS( link.href, link );
				link.rel = null;
				onloadCSS(newLink, function () {
					if (/\/main\.css/.test(this.href)) {
						w.ftNextFireCondition('MainCssLoaded');
					}
				});
			}
		}
	}
}());
/*eslint-enable*/
