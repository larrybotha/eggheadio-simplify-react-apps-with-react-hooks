import {useContext, useEffect, useRef, useReducer} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'
import isEqual from 'lodash/isEqual'

/*
 * Create a custom hook for setting state
 *
 * We pass in an initial state so that this hook is generic, and can be used by
 * other components, and return both the state and dispatch function
 */
function useSetState(initialState) {
  const [state, setState] = useReducer(
    (state, newState) => ({
      ...state,
      ...newState,
    }),
    initialState,
  )

  return [state, setState]
}

/*
 * Intead of relying only the custom hook above, we can add safety to updating
 * state by creating a safe set state custom hook that extends the custom set state
 * hook
 *
 * The lpgic for determining whether a component is mounted or not can now be
 * contained within this custom hook, and the component that uses this hook can
 * now set state safely via s single neat absstraction
 */
function useSafeSetState(initialState) {
  const [state, setState] = useSetState(initialState)

  const isMountedRef = useRef()

  useEffect(() => {
    isMountedRef.current = true

    return () => (isMountedRef.current = false)
  }, [])

  const setStateSafely = (...args) => isMountedRef.current && setState(...args)

  return [state, setStateSafely]
}

/*
 * Create a generic ref for holding previous values
 *
 * Because we want the the component to evaluate the previous render, this
 * hook _must_ be placed after any values that are evaluating the previous value
 * within the component.
 *
 * If this hook were to be used at the top of the component, we would be updating
 * the ref at the beginning of each render, losing the previous render's value,
 * making this hook redundant
 *
 * The order of placement of hooks, as with any synchronous code, is important
 */
const usePrevious = value => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

function Query({query, variables, children, normalize = data => data}) {
  const client = useContext(GitHub.Context)

  /*
   * Instead of defining stState here with useReducer, we can use a custom hook to
   * abstract the logic away from here
   */
  const [state, setState] = useSafeSetState({
    data: null,
    error: null,
    fetching: false,
    loaded: false,
  })

  useEffect(() => {
    if (isEqual(previousInputs, [query, variables])) {
      return
    }

    setState({fetching: true})
    client
      .request(query, variables)
      .then(res =>
        setState({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })

  /*
   * Place usePrevious _after_ our effect, so that we store the values after
   * useEffect has run, otherwise we'll be storing the same values that useEffect
   * evaluates against
   *
   * Remember - all of this is synchronous, so we need to ensure that we only
   * set a value on the ref before the component re-renders, so that on the current
   * render previousInputs holds the values from the previous render
   */
  const previousInputs = usePrevious([query, variables])

  return children(state)
}
Query.propTypes = {
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
}

export default Query
