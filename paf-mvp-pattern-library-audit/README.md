# OneKey UI

## Installation

- `npm install` to install the dependencies
- `npm start` to run the pattern library

## Documentation

The docs for using, building, and customising the pattern library are available within the pattern library itself:

- http://localhost:6006/
- Or [stories/Introduction.stories.mdx](stories/Introduction.stories.mdx)

## Why Storybook?

We wanted to build a collection of components which can be defined once and reused across the various views. Ideally we could show the different variants/states of the components. [Storybook](https://storybook.js.org/) is a recognised solution for building pattern libraries like this, and offers both a way of starting with a lightweight solution, and allowing the pattern library to mature with [docs](https://storybook.js.org/docs/react/writing-docs/introduction).

### Stories

From [Storybook](https://storybook.js.org/docs/react/get-started/whats-a-story):

> A story captures the rendered state of a UI component. Developers write multiple stories per component that describe all the “interesting” states a component can support.

The components have been written to support the features that have been highlighted in the stories.

### Our components

The components are Javascript functions that return HTML.

Components exist for two main purposes:

1. To allow stories to be written showing their variants/states, e.g. different versions of Advert Status
2. To allow reuse of components across the groups

### Our groups

The groups are combinations of multiple components to create the planned application views, e.g. the Advert card.