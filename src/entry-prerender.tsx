import { renderToString } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RecordSyncBoundary } from './components/RecordSyncBoundary';
import { AuthProvider } from './contexts/AuthContext';

export async function renderPublicLanding(): Promise<string> {
  const tree = (
    <ErrorBoundary scope="root">
      <StaticRouter location="/">
        <AuthProvider initialPublicGuest>
          <RecordSyncBoundary>
            <App />
          </RecordSyncBoundary>
        </AuthProvider>
      </StaticRouter>
    </ErrorBoundary>
  );
  let renderError: unknown;
  const { prelude, postponed } = await prerenderToNodeStream(tree, {
    signal: AbortSignal.timeout(5000),
    onError(error) {
      renderError = error;
    },
  });
  // Resolve the real route's lazy modules without shipping streaming fallback
  // segments or their insertion scripts in a static document. Server effects
  // do not run; the second render uses the identical tree and settled modules.
  for await (const _chunk of prelude) {
    /* drain the completed prerender */
  }
  if (renderError) throw renderError;
  if (postponed !== null) throw new Error('Public Landing prerender did not complete');
  const html = renderToString(tree);
  if (/<!--\$[?!]-->/.test(html))
    throw new Error('Public Landing still has an unresolved boundary');
  return html;
}
