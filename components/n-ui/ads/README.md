# n-ui/ads

This component is responsible for initialising o-ads with the correct config for the page.

To include an ad slot, place an HTML element where the ad is supposed to go, as below:
```
<div
	class="o-ads my-advert-class
	o-ads__label-left"
	data-o-ads-name="mpu"
	data-o-ads-center="true"
	data-o-ads-label="true"
	data-o-ads-targeting="pos=mpu;"
	data-o-ads-formats-default="MediumRectangle,Responsive"
	data-o-ads-formats-small="MediumRectangle,Responsive"
	data-o-ads-formats-medium="MediumRectangle,Responsive"
	data-o-ads-formats-large="false"
	data-o-ads-formats-extra="false"
	aria-hidden="true"></div>
```

See the documentation for [<o-ads>](http://registry.origami.ft.com/components/o-ads) for more.

###Sizes

The "breakpoints" for ads (e.g. `data-o-ads-formats-medium`) differ slightly from the o-grid breakpoints, in that they are decided based on the widths of non-responsive ad formats such as leaderboards.

They are as follows:

* default: 0px
* small: 489px
* medium: 760px
* large: 1000px
* extra: 1025px


NOTE: please speak to AdOps or a member of the Advertising team about the value to use for `data-o-ads-targeting`.

##AB tests

To run an AB test on ads layout, you need to set a `data-ads-layout` property on the HTML element. This will be used for targeting/reporting purposes.

This sets a targeting parameter for DFP called `nlayout`, which can be used to get AdOps to target different adverts to the page (which can be useful for AB testing or creating demo pages).

e.g. `<html data-ads-layout="front-page-temporary-ab">`;

The format this needs to be is following: `APPNAME-TESTNAME`, e.g. `front-page-temporary-ab`. You will need to notify Ads/AdOps of the value you are using, so they can update DFP to accept that value.

Any changes to slot config/positioning can be done within the consuming app itself.

e.g.

```
{{#if @root.flags.advertsLayoutTest}}
	<div class="o-ads" data-o-ads-formats-large="Billboard,Responsive"...>
{{#else}}
	<div class="o-ads" data-o-ads-formats-large="Leaderboard,Responsive"...>
{{#endif}}
```



This is also the 'tag manager' for ads on Next. It's to be used to house all third party scripts.

## Background

The old ft.com had an eglalitarian means of adding JavaScript to the web page.

This caused problems for web page performance, technical support, and managing overall coherance of the product.

On the new ft.com we aim to centralise our third-party code to give everyone more oversight about what's being added to ft.com.

## Ground rules

Anyone (in the world) can make a PR to this project.

Successful requests will be reviewed and merged in to the FT code base.

### Management

- Each script MUST have an expiring [flag](https://github.com/Financial-Times/next-flags-api) to allow it to be toggled on and off.
- You MUST scope the loading of the tag to collect the minimally useful data set. _Eg, scope the script to a geographic region, individual URL, group of users, or use sampling techniques._
- You MUST document what the tag does and its impact on performance, network etc. in the pull request and/or the code as a comment.
- You MUST document the browser support.
- Requests for the addition of tag managers or anything that exists soley for the purpose of inserting other tracking code will be rejected.
- You MUST consider whether we already collect this data in RedShift or other provider, i.e. avoid collecting it twice.
- You MUST consider the effort/cost of adapting existing tracking systems to collect the additional information needed before introducing new libraries.
- You SHOULD discuss your requirements and proposals directly with the next development team.

### Performance

- 3rd party tracking and associated assets SHOULD be hosted on FT.com, or supplied as a bower module implementing semver.
- Tracking code and assets MUST all be available over HTTPS/TLS.
- SHOULD not include any large 3rd party libraries e.g. jQuery
- SHOULD be on a CDN or similar highly available & distributed infrastructure.

### Quality

- SHOULD Not pollute the global name space.
- SHOULD Not produce console output (i.e errors)
- SHOULD Not set any cookies or localStorage data.
