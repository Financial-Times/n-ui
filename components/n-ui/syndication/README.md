# Syndication

This contains the implementation for the syndication indicator.  This indiciator is for users who subscribe to our [syndication platform](http://ftsyndication.com/).  Each article contains an attribute to display if it can be syndicated or not.  We then show a tick icon or a red icon that is supposed to look a bit like a stop sign to dislay the status.  They look like this:

Article which can be syndicated:
[INSERT IMAGE]

Article which can not be syndicated:
[INSERT IMAGE]

There are some article where the syndication status cannot be easily known (fastFT, for example).  For these, we show no icon at all.

## I can't see the icons!

You need to be a syndication subscriber to see them - on a technical level this means having `S1` in your [products list](https://session-next.ft.com/products).  To get this contact Rika Niekzad or, failing that, maybe syndhelp@ft.com can help you.

## Where does the data come from?
The Content API has the property `canBeSyndicated` which is a string containing either `yes`, `no` or `verify`.  This property is available in Next's Elastic search cluster and in [Next API](https://github.com/Financial-Times/next-api)

## This is just some javascript - is there other code elsewhere?
Yep - These links will probably be wrong pretty soon but will hopefully point you in the right direction:

**n-teaser** - https://github.com/Financial-Times/n-teaser/blob/master/src/presenters/teaser-presenter.js#L77
Here we add an additional modifier if syndication is available on this article

**next-article** - https://github.com/Financial-Times/next-article/blob/master/views/content.html#L20
Here a data attribute is added containing the syndication status of the article.

**generic** - add the following data attributes to your markup:

* `data-syndicatable-uuid` – the uuid of the content to syndicate
* `data-syndicatable-title` – the title of the content to syndicate
* `data-syndicatable` – `yes` / `no` / `verify`
* `data-syndicatable-target` – the element to insert the syndication flag
