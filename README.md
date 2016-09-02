# n-ui

An experiment bunching some of Next's client-side code into a single repository. [Motivation](Explainer.md).

This project consists of many modules. They include the primitive building blocks used by the majority of Next applications, constitute the basic look and feel of a page and integrate with upstream Origami modules for consistency across FT digital products.

## Usage

For usage information see [the wiki](https://github.com/Financial-Times/n-ui/wiki).

## Dev workflow

Run `make demo` to check if your changes work. Feel free to edit and commit whatever changes you like to th contents of the demo files... just don't expect them to still be there next time you come to the repo.

Most of the time you should be ok to test stuff in the demo, merge to master when happy and `bottle`, which will also take care of pushing a new version up to the CDN. It can take up to an hour for every node of the CDN to pick up the changes. If you want to test something out create a beta tag in your branch and then install n-ui at this beta version in your app. You can also turn off the `nUiBundle` flag to force your app to not use the copy of n-ui from the CDN

## **An important note on releases **

n-ui is packaged independently and served on a url shared between apps. To keep our cache hit rate high for this url please observe the following conventions

- major releases - same as semver
- minor releases - reserve these for when you are adding a feature that needs the js to be updated at the same time as the templates
- patch releases - all other releases, including some which might normally be considered minor e.g. adding a sass mixin, adding a js method

If you forget to do the above and just stick to semver nothing will break, but it will mean our cache gets diluted
