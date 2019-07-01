/* @jsx jsx */
import {jsx} from '@emotion/core'

import React from 'react'
import {navigate, createHistory} from '@reach/router'
import netlify from 'netlify-auth-providers'
import {GraphQLClient} from 'graphql-request'
import {PrimaryButton} from './shared/pattern'

const GitHubClientContext = React.createContext()
const {Provider, Consumer} = GitHubClientContext

async function authWithGitHub() {
  return new Promise((resolve, reject) => {
    var authenticator = new netlify({
      site_id: process.env.REACT_APP_NETLIFY_SITE_ID,
    })
    authenticator.authenticate(
      {provider: 'github', scope: 'public_repo,read:org,read:user'},
      function(err, data) {
        if (err) {
          reject(err)
        }
        resolve(data)
      },
    )
  })
}

const history = createHistory(window)

class GitHubClientProvider extends React.Component {
  /*
   * state in here can be initialised using useState
   *
   * Because one of the values in state is derived from props, and only once
   * when the constructor is called on mount, we can use the initialiser
   * function that useState accepts to set the initial state
   */
  constructor(...args) {
    super(...args)
    this.state = {error: null}
    if (this.props.client) {
      this.state.client = this.props.client
    } else {
      const token = window.localStorage.getItem('github-token')
      if (token) {
        this.state.client = this.getClient(token)
      }
    }
  }

  /*
   * This componentDidMount is definined side effects - we can place them inside
   * useEffect instead
   *
   * this.unsubscribeHistory is defined here purely so that it may be called in
   * componentWillUnmount
   *
   * if a function is returned in useEffect, that functino will be called every
   * time a value in the dependency array changes, or when the component
   * unmounts. Because we want the unsubscribe to only occur when the component
   * unmounts, we can pass an empty dependency array to useEffect
   */
  componentDidMount() {
    if (!this.state.client) {
      navigate('/')
    }
    this.unsubscribeHistory = history.listen(() => {
      if (!this.state.client) {
        navigate('/')
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribeHistory()
  }

  getClient = token => {
    const headers = {Authorization: `bearer ${token}`}
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers,
    })
    return Object.assign(client, {
      login: this.login,
      logout: this.logout,
    })
  }

  /*
   * this function uses this.setState. In the hooks implementation it'll use the
   * state update function returned from useState
   */
  logout = () => {
    window.localStorage.removeItem('github-token')
    this.setState({client: null, error: null})
    navigate('/')
  }

  login = async () => {
    const data = await authWithGitHub().catch(error => {
      console.log('Oh no', error)
      this.setState({error})
    })
    window.localStorage.setItem('github-token', data.token)
    this.setState({client: this.getClient(data.token)})
  }

  render() {
    const {client, error} = this.state
    const {children} = this.props

    return client ? (
      <Provider value={client}>{children}</Provider>
    ) : (
      <div
        css={{
          marginTop: 250,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {error ? (
          <div>
            <p>Oh no! There was an error.</p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div>
            <PrimaryButton onClick={this.login}>
              Login with GitHub
            </PrimaryButton>
          </div>
        )}
      </div>
    )
  }
}

export {
  GitHubClientProvider as Provider,
  Consumer,
  GitHubClientContext as Context,
}

/*
eslint
no-unused-vars: ["warn", {"varsIgnorePattern": "(jsx)"}]
react/react-in-jsx-scope: "off"
*/
