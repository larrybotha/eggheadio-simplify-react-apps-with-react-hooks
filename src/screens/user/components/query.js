import {useContext, useEffect, useRef, useReducer} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'
import isEqual from 'lodash/isEqual'

function Query({query, variables, children, normalize = data => data}) {
  /*
   * replace
   *    static contextType = GitHub.Context
   *
   * with useContext
   */
  const client = useContext(GitHub.Context)

  /*
   * replace the state defined in the class with useReducer
   *
   * We're not making use of React's function syntax here for updating state;
   * we're simply spreading new state with old state
   *
   * useReducer accepts two arguments:
   * 1 - the reducer itself
   * 2 - the initial state
   *
   * useReducer returns a tuple:
   * 1 - the updated state
   * 2 - the reducer function that can be used to updated state from within the
   * component
   */
  const [state, setState] = useReducer(
    (state, newState) => ({
      ...state,
      ...newState,
    }),
    {loaded: false, fetching: false, data: null, error: null},
  )

  /*
   * replace this.query() with useEffect
   */
  useEffect(() => {
    /*
       * Instead of using useEffect's dependency array, we can do the check
       * ourselves, and exit useEffect after manually checking that the
       * properties are the same
       *
       * Evaluate whether previousInputsRef.current (the current value stored on
       * the ref) is different from the properties received from the parent
       * component
       */
    if (isEqual(previousInputsRef.current, [query, variables])) {
      return
    }

    /*
{      * state is now set using our setState returned from our reducer
       */
    setStateSafely({fetching: true})

    /*
       * we now have Github client accessible via our useContext hook
       *
       * state is also maintained by using setState from our reducer, and our
       * props now come from being passed into this component as parameters
       */
    client
      .request(query, variables)
      .then(res =>
        setStateSafely({
          data: normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        setStateSafely({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  })

  /*
   * create a ref for us to store data in the component that is outside of
   * React's state lifecycle
   *
   * This ref is hoisted above the query useEffect, so by the time useEffect's
   * callback is called, previousInputsRef is available from within the callback
   */
  const previousInputsRef = useRef()

  /*
   * We need to store the previousInputsRef in order to be able to compare them in
   * the query useEffect to determine whether the effect should be executed or
   * exited.
   *
   * Because previousInputsRef is a ref, and thus is not something that will change
   * on each render, we are essentially executing a side effect. This means that
   * we should update the ref from within useEffect
   *
   * This effect has to come after the query effect, otherwise on the first
   * render the query useEffect will determine that it doesn't need to render
   * anything, because previousInputsRef will be the same as the props against
   * which isEqual is being compared
   */
  useEffect(() => {
    /*
     * The value stored on a ref is stored on the ref.current property
     */
    previousInputsRef.current = [query, variables]
  })

  const isMountedRef = useRef()
  useEffect(() => {
    isMountedRef.current = true

    return () => (isMountedRef.current = false)
  }, [])
  const setStateSafely = (...args) => isMountedRef.current && setState(...args)

  /*
   * return children with the state managed via useReducer
   */
  return children(state)
}
Query.propTypes = {
  children: PropTypes.func.isRequired,
  normalize: PropTypes.func,
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
}

export default Query
