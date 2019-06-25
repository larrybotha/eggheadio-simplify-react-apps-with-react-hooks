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
    if (isEqual(previousInputsRef.current, [query, variables])) {
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

  const previousInputsRef = useRef()

  useEffect(() => {
    previousInputsRef.current = [query, variables]
  })

  return children(state)
}
Query.propTypes = {
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
}

export default Query
