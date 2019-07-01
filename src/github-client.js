/* @jsx jsx */
import {jsx} from '@emotion/core'

import React, {useEffect, useState} from 'react'
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

const GitHubClientProvider = props => {
  /*
   * error was stored on state, so useState is a good candidate to manage errors
   * in our new component
   */
  const [error, setError] = useState(null)

  /*
   * The client was also stored on state, so useState is again a good candidate
   *
   * Because the state was set from props in the original constructor, we need
   * to set the initial state using the props
   *
   * useState accepts an initialiser function, instead of initial state data,
   * and this initialiser function is only called the first time a component is
   * rendered. This is a good approach, because we don't want to reach into
   * localStorage on every render
   *
   * The initialiser function needs to explicitly return the value we want set
   * as the initial state
   */
  const [client, setClient] = useState(() => {
    /*
     * if a client is passed through via props, use that, else...
     */
    if (props.client) {
      return props.client
    } else {
      /*
       * We should avoid reaching into localStorage on every render; hence we
       * use the initialiser function inside this useState
       */
      const token = window.localStorage.getItem('github-token')

      if (token) {
        return getClient(token)
      }
    }
  })

  function getClient(token) {
    const headers = {Authorization: `bearer ${token}`}
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers,
    })

    return Object.assign(client, {
      login,
      logout,
    })
  }

  function logout() {
    window.localStorage.removeItem('github-token')
    setError(null)
    setClient(null)
    navigate('/')
  }

  async function login() {
    const data = await authWithGitHub().catch(error => {
      console.log('Oh no', error)
      setError(error)
    })
    window.localStorage.setItem('github-token', data.token)
    setClient(getClient(data.token))
  }

  /*
   * useEffect is not an exact match to componentDidMount and componentWillUnmount;
   * it's a better mental model to think of it as a combination of cdm, cwu, and
   * componentDidUpdate
   *
   * Additionally, useEffect runs asynchronously sometime after a render.
   * componentDidMount runs synchronously right after the first render
   *
   * Because we only want this effect to run after the component renders, and
   * before the component unmounts, we pass it an empty dependency array
   */
  useEffect(() => {
    if (!client) {
      navigate('/')
    }

    /*
     * In the original component unsubscribeHistory was set as an instance
     * method so that it could be used from within componentWillUnmount.
     *
     * With useEffect we need to return a function that is called when the
     * component unmounts, so we can define unsubscribeHistory in here, and
     * return a function that calls it
     */
    const unsubscribeHistory = history.listen(() => {
      if (!client) {
        navigate('/')
      }
    })

    /*
     * run unsubscribeHistory when the component unmounts
     */
    return function cleanup() {
      unsubscribeHistory()
    }
  }, [])

  return client ? (
    <Provider value={client}>{props.children}</Provider>
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
          <PrimaryButton onClick={this.login}>Login with GitHub</PrimaryButton>
        </div>
      )}
    </div>
  )
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
