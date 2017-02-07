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
The Content API has the property `canBeSyndicated` which is a string containing either `yes`, `no` or `verify`.  This property is available in Next's ELastic search cluster and in [Next API](https://github.com/Financial-Times/next-api)
