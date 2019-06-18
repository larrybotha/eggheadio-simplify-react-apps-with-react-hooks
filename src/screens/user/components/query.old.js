import {Component} from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import * as GitHub from '../../../github-client'

/*
 * Hooks can't be used on classes, so this component will need to be refactored
 * to a function component
 */
class Query extends Component {
  /*
   * These will become function parameters
   */
  static propTypes = {
    query: PropTypes.string.isRequired,
    variables: PropTypes.object,
    children: PropTypes.func.isRequired,
    normalize: PropTypes.func,
  }

  /*
   * This will be a parameter with a default value
   */
  static defaultProps = {
    normalize: data => data,
  }

  /*
   * This will use the useContext hook
   */
  static contextType = GitHub.Context

  /*
   * state will either be represented by the useState hook, or useReducer hook.
   *
   * David Khourshid recommends reaching for useReducer by default, unless your
   * state can be represented by 1 or maybe 2 properties
   */
  state = {loaded: false, fetching: false, data: null, error: null}

  componentDidMount() {
    this._isMounted = true
    this.query()
  }

  /*
   * executing this query is a side effect, so we can use the array passed to
   * useEffect to determine when this.query() will be called
   */
  componentDidUpdate(prevProps) {
    if (
      !isEqual(this.props.query, prevProps.query) ||
      !isEqual(this.props.variables, prevProps.variables)
    ) {
      this.query()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  /*
   * This is an effect - use useEffect
   */
  query() {
    this.setState({fetching: true})
    const client = this.context
    client
      .request(this.props.query, this.props.variables)
      .then(res =>
        this.safeSetState({
          data: this.props.normalize(res),
          error: null,
          loaded: true,
          fetching: false,
        }),
      )
      .catch(error =>
        this.safeSetState({
          error,
          data: null,
          loaded: false,
          fetching: false,
        }),
      )
  }

  /*
   * This is primarily the same as a reducer spreading new state on existing
   * state
   */
  safeSetState(...args) {
    this._isMounted && this.setState(...args)
  }

  /*
   * This component is a render prop, expecting children to be a function
   */
  render() {
    return this.props.children(this.state)
  }
}

export default Query
