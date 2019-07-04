/* @jsx jsx */
import {jsx} from '@emotion/core'

import {useEffect} from 'react'
import {navigate} from '@reach/router'
import {Input, PrimaryButton, IsolatedContainer} from '../../shared/pattern'

function handleSubmit(e) {
  e.preventDefault()
  const username = e.target.elements.username.value.trim()
  navigate(`/${username}`)
}

function Home() {
  /*
   * We know that users visiting the home page will be visiting the user page
   * next, so instead of loading the chunk when they navigate to the page, and
   * then making the request to grahoql, we can preload the chunk, so that when
   * the user navigates there the graphql query can fire stragiht away
   *
   * To achieve this, we can use React's useEffect. We only want to preload the
   * user page once, so we place Webpack's import inside the useEffect, with an
   * empty dependecy array
   */
  useEffect(() => {
    import('../user')
  }, [])

  return (
    <IsolatedContainer>
      <form
        onSubmit={handleSubmit}
        css={{
          display: 'flex',
          justifyContent: 'center',
          maxWidth: 240,
          margin: 'auto',
        }}
      >
        <Input
          type="text"
          name="username"
          placeholder="Enter a GitHub username"
          autoFocus
          css={{
            borderRight: 'none',
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0',
            minWidth: 190,
          }}
        />
        <PrimaryButton
          css={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          type="submit"
        >
          Go
        </PrimaryButton>
      </form>
    </IsolatedContainer>
  )
}

export default Home

/*
eslint
no-unused-vars: ["warn", {"varsIgnorePattern": "(jsx)"}]
react/react-in-jsx-scope: "off"
*/
