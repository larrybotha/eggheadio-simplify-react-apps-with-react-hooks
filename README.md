# Simplify React Apps With React Hooks

Notes and annotations for Egghead's [Simplify React Apps with React Hooks](https://egghead.io/courses/simplify-react-apps-with-react-hooks)

Folder structure from [this gist](https://gist.github.com/ryanflorence/daafb1e3cb8ad740b346).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [02. Refactor a Class Component with React hooks to a Function](#02-refactor-a-class-component-with-react-hooks-to-a-function)
- [03. Handle Deep Object Comparison in React's `useEffect` hook with the `useRef` Hook](#03-handle-deep-object-comparison-in-reacts-useeffect-hook-with-the-useref-hook)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 02. Refactor a Class Component with React hooks to a Function

[query.02.js](./src/screens/user/components/query.02.js)

[query.original.js](./src/screens/user/components/query.original.js)

Firstly, hooks are only available to function components. The first step is to
begin moving class properties to function parameters.

*Takeaways:*

- hooks can only be used in function components
- `componentDidUpdate` containing effects is a good indicator of having to use
    `useEffect` with the properties being compared as the values that need to be
    provided in `useEffect`s array
- `useReducer` can be used to replace state in a class component. It accepts a
    reducer, and the initial state, and returns a state object and the dispatch
    function for state to be updated. The first argument `useReducer` accepts is
    the current state.
- `static contextType = My.Context` can be replaced with `const context = useContext(My.Context)`

## 03. Handle Deep Object Comparison in React's `useEffect` hook with the `useRef` Hook

[query.js](./src/screens/user/components/query.js)

[query.02.js](./src/screens/user/components/query.02.js)

Before the previous refactor we were using `lodash/isEqual` to do a deep
comparison of the `variables` argument passed into the component. If that
property happens to be an object, and because it's passed down from the parent
component, React will determine that the object is not equal, and fire the
effect on every render.

We need to ensure that a deep comparison of the variable is done to prevent
unnecessary requests.

To do this:

- remove the dependencies array from `useEffect`
- compare the previous inputs with the new inputs from within `useEffect`
- create a ref in which to store the previous inputs
- create another `useEffect` which will be responsible for storing the previous
    inputs once the query `useEffect` has run

*Takeaways:*

- one can do a manual comparison from within `useEffect` instead of relying on
    `useEffect`s dependecy array which will only perform shallow equality checks
- the order of `useEffects` within a component matter - they are executed
    synchronously
- values in a ref are stored on the `current` property
- `useRef` allows one to create a ref, and refs can store anything outside of a
    component's state or props
