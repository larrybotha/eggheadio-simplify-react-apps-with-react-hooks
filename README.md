# Simplify React Apps With React Hooks

Notes and annotations for Egghead's [Simplify React Apps with React Hooks](https://egghead.io/courses/simplify-react-apps-with-react-hooks)

Folder structure from [this gist](https://gist.github.com/ryanflorence/daafb1e3cb8ad740b346).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [02. Refactor a Class Component with React hooks to a Function](#02-refactor-a-class-component-with-react-hooks-to-a-function)
- [03. Handle Deep Object Comparison in React's `useEffect` hook with the `useRef` Hook](#03-handle-deep-object-comparison-in-reacts-useeffect-hook-with-the-useref-hook)
- [04. Safely `setState` on a Mounted React Component through the `useEffect` Hook](#04-safely-setstate-on-a-mounted-react-component-through-the-useeffect-hook)
- [05. Extract Generic React Hook Code into Custom React Hooks](#05-extract-generic-react-hook-code-into-custom-react-hooks)
- [06. Track Values Over the Course of Renders with React `useRef` in a Custom `usePrevious` Hook](#06-track-values-over-the-course-of-renders-with-react-useref-in-a-custom-useprevious-hook)
- [07. Refactor a React Class Component with useContext and useState Hooks](#07-refactor-a-react-class-component-with-usecontext-and-usestate-hooks)
- [08. Refactor a render Prop Component to a Custom React Hook](#08-refactor-a-render-prop-component-to-a-custom-react-hook)
- [09. Handle componentDidMount and componentWillUnmount in React Component Refactor to Hooks](#09-handle-componentdidmount-and-componentwillunmount-in-react-component-refactor-to-hooks)

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
- create a ref in which to store the previous inputs without forcing a render
    when values are updated in the ref
- create another `useEffect` which will be responsible for storing the previous
    inputs once the query `useEffect` has run

*Takeaways:*

- one can do a manual comparison from within `useEffect` instead of relying on
    `useEffect`s dependecy array which will only perform shallow equality checks
- the order of `useEffects` within a component matter - they are executed
    synchronously
- values in a ref are stored on the `current` property
- `useRef` allows one to create a ref, and refs can store anything outside of a
    component's state or props and be updated without forcing a re-render

## 04. Safely `setState` on a Mounted React Component through the `useEffect` Hook

[query.js](./src/screens/user/components/query.js)

[query.03.js](./src/screens/user/components/query.03.js)

Because `useEffect` is executing an asynchronous request and `setState`, the
`dispatch` function returned from `useReducer`, is called when the promise is
resolved or rejected, we need to ensure that if the component is unmounted that
`setState` is not called, as `useState` and `useReducer`s returned updater
functions can't be called on unmounted components without throwing errors.

To fix this, we can use:

- a ref to store the mounted state of the component
- use `useEffect` to set the ref to indicate that the component is mounted
- only call `setState` if the ref indicates the component is mounted
- return a callback from within `useEffect` that will set the ref to indicate
    the component is no longer mounted
- provide an empty deps array to `useEffect` to ensure that it is only called
    once on mount, and once on unmount

*Takeaways:*

- asynchronous operations within `useEffect` should have guards to ensure that
    calls to the component's functions are not executed if the component is no
    longer mounted
- a ref is a good place to store this state, as we don't want rerenders to be
    triggered when it is updated
- `useEffect`s return callback is a sort of teardown function which can be used
    to undo what `useEffect` does
- an empty array as deps for `useEffect` will result in the effect only being
    executed on mount, and on unmount

## 05. Extract Generic React Hook Code into Custom React Hooks

[query.js](./src/screens/user/components/query.js)

[query.04.js](./src/screens/user/components/query.04.js)

One can create a custom hook outside of a component that can then be used inside
the component. This is useful for hooks that are common, and less so for hooks
that are within a single component only.

*Takeaways:*

- a custom hook can make use of another custom hook and extend it
- `useRef` can be used inside the custom hook in the same way as within the
    component, allowing one to abstract the logic for whether a component is
    mounted or not

## 06. Track Values Over the Course of Renders with React `useRef` in a Custom `usePrevious` Hook

[query.js](./src/screens/user/components/query.js)

[query.05.js](./src/screens/user/components/query.05.js)

One can extract `useRef` to a custom hook. In this scenario we've extracted a
hook that could be useful for other components that need to evaluate props from
previous renders.

*Takeaways:*

- the order of hooks is important - the `usePrevious` hook in this example would
    be of no value if it were called before any code that needed to evaluate the
    previous render's props

## 07. Refactor a React Class Component with useContext and useState Hooks

[user/index.js](./src/screens/user/components/user/index.js)

[user/index.orig.js](./src/screens/user/components/query.orig.js)

A simple refactor of a class component to a component function:

- replace `static contextType` and `this.context` with `userContext`
- replace component state with `useState`

## 08. Refactor a render Prop Component to a Custom React Hook

[user/index.js](./src/screens/user/components/index.js)

[user/index.07.js](./src/screens/user/components/index.07.js)

[query.js](./src/screens/user/components/query.js)

[query.06.js](./src/screens/user/components/query.06.js)

A render prop is useful, but creates a lot of nesting. By moving the props a
render prop provides to a custom hook, one can remove the nesting, and import
the custom hook instead.

Furthermore, a render prop can be created from the custom hook by simply
creating a component function that accepts props from a parent, and returns the
custom hook with those props appled:

```javascript
const useCustomHook = () => {}

const MyRenderProp = props => useCustomHook(props);
```

*Takeaways:*

- render props can be refactored to custom hooks (given the render prop doesn't
    have any of its own markup to render)
- this can be done by:

      1. removing `children` from the render prop's props
      2. returning state directly
      3. exporting a component function that wraps props passed in and returns
          the custom hook so that we still have a render props component
      4. replacing the render prop in the component with the custom hook, getting
          the state provided by the old render prop from the new custom hook

## 09. Handle componentDidMount and componentWillUnmount in React Component Refactor to Hooks
