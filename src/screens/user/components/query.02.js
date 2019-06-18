import {useContext, useEffect, useReducer} from 'react'
import PropTypes from 'prop-types'
import * as GitHub from '../../../github-client'

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
  useEffect(
    () => {
      /*
{      * state is now set using our setState returned from our reducer
       */
      setState({fetching: true})

      /*
       * we now have Github client accessible via our useContext hook
       *
       * state is also maintained by using setState from our reducer, and our
       * props now come from being passed into this component as parameters
       */
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
    },
    /*
     * our componentDidUpdate defined when this effect will be called, and it
     * should be done every time query and variables change, so we specify that
     * here
     *
     * The problem with the comparison over here is that React will check for
     * object equality, and not do a deep comparison of the properties. Because
     * of this, and because the variables are being passed in as a property to
     * the component, every render will result in this effect being called
     * (since different objects with the same properties are not equal)
     */
    [query, variables],
  )

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
