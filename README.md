# Simplify React Apps With React Hooks

Notes and annotations for Egghead's [Simplify React Apps with React Hooks](https://egghead.io/courses/simplify-react-apps-with-react-hooks)

Folder structure from [this gist](https://gist.github.com/ryanflorence/daafb1e3cb8ad740b346).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [02. Refactor a Class Component with React hooks to a Function](#02-refactor-a-class-component-with-react-hooks-to-a-function)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 02. Refactor a Class Component with React hooks to a Function

[query.js](./src/screens/user/components/query.old.js)

[query.old.js](./src/screens/user/components/query.old.js)

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
