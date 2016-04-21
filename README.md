# n-ui

## What is this?

An experiment bunching some of Next's client-side code into a single repository.

## Motivations

### Ease integration

- 25+ Origami components
- 15+ n- UI components
- Far fewer places update
- Fewer conflicts!

### Increase oversight

- Easy to find precedent
- More people working in a shared space
- A single place to report issues

### Reduce duplication

- One repo place to grep
- Share code, fewer leaky abstractions
- Better peer review

### Improve quality

- A single set of tools and rules
- Components are less likely to be forgotten
- A stable target for cross-browser testing, device testing and visual regression (maybe)

## Problems we would like to solve

### Decrease duplication

Our stylesheets are peculiarly large. One reason for this is that many of our components have the same dependency on Origami components and integrate them in [silent mode](http://origami.ft.com/docs/syntax/scss/#silent-styles).

For example, several components and applications depend on `o-buttons` (and it's leaky abstraction `n-buttons`), each time implementing their properties via the mixins `oButtons()` and `nButtons()`.

This duplication cannot be adequately cleaned up by any tooling because to do so would require breaking the cascade as authored. As of writing the basic styles for a button are duplicated _13_ times in production on the Next front page.

Conceivably moving components into a single repository should enable us to safely import the component fewer times (hopefully once) and use the class names as intended rather than always using the mixins.

### Ease integration with external components

When a major version of an external dependency (E.G. an Origami component.) is released rolling it out is currently very difficult. Performing the required changes across multiple component and application repos and synchronising their releases is nightmarish. With more of our components in one place the necessary changes can be made with fewer pull request and the components affected are released simultaneously.

... Got any more? Contribute pls.
