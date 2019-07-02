import './global-styles.css'
import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import {Router} from '@reach/router'
import ErrorBoundary from 'react-error-boundary'
import ThemeProvider from './shared/theme-provider'
import {IsolatedContainer, LoadingMessagePage} from './shared/pattern'
import * as GitHubContext from './github-client'

/*
 * In the original implementation we needdd to handle if our loading fallback
 * was receiving an error, and then rethrow that error so that our
 * ErrorBoundary could handle it
 *
 * With React Suspense there's no need to handle the error, as Suspense throws
 * the error for us, which our ErrorBoundary can then handle
 *
 * Because of this, there's no need to extend the loading fallback with the
 * rethrowing of the error, and we can instead pass the loading fallback
 * directly to Suspense
 */

/*
 * React.lazy accepts a function which returns the promise return from calling
 * the dynamic import feature proposed for javascript
 *
 * With webpack and other libraries, this results in the lazy-loaded components
 * being split into their own chunks
 */
const Home = React.lazy(() => import('./screens/home'))
const User = React.lazy(() => import('./screens/user'))

/*
 * We need an error boundary to handle errors
 *
 * React used to fail with an error, but without updating the UI, resulting in a
 * broken experience
 *
 * With the introductino of error boundaries, React will unmount the entire app
 * if the error is not handled. The thinking behind this is that it's better to
 * encourage the explicit handling of errors, and to not leave users in a
 * situation where the UI appears to be operating, but isn't
 */
function ErrorFallback({error}) {
  return (
    <IsolatedContainer>
      <p>There was an error</p>
      <pre style={{maxWidth: 700}}>{JSON.stringify(error, null, 2)}</pre>
    </IsolatedContainer>
  )
}

/*
 * In order to use React.lazy, components that are dynamically imported need to
 * be rendered within the context of a Suspense component.
 *
 * Suspense requires a fallback component to render while the promise in the
 * lazy component is being resolved
 */
function App() {
  return (
    <ThemeProvider>
      <GitHubContext.Provider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense
            fallback={
              <LoadingMessagePage>Loading Application</LoadingMessagePage>
            }
          >
            <Router>
              <Home path="/" />
              <User path="/:username" />
            </Router>
          </Suspense>
        </ErrorBoundary>
      </GitHubContext.Provider>
    </ThemeProvider>
  )
}

const ui = <App />
const container = document.getElementById('root')

ReactDOM.render(ui, container)
