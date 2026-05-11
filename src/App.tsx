import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Layout from './components/Layout';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import { useAuth } from './contexts/AuthContext';
import { saasmaker } from './lib/saasmaker';

const Concepts = lazy(() => import('./pages/Concepts'));
const Login = lazy(() => import('./pages/Login'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Playground = lazy(() => import('./pages/Playground'));
const Review = lazy(() => import('./pages/Review'));
const Today = lazy(() => import('./pages/Today'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-400" />
    </div>
  );
}

function App() {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    saasmaker.analytics.track({ name: 'page_view', url: location.pathname }).catch(() => {});
  }, [location.pathname]);

  if (loading) {
    return <PageFallback />;
  }

  if (!user && !isGuest) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Login />
      </Suspense>
    );
  }

  return (
    <>
      <SaaSMakerFeedback />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="concepts" element={<Concepts />} />
            <Route path="review" element={<Review />} />
            <Route path="mock" element={<MockInterview />} />
            <Route path="playground" element={<Playground />} />
            {/* Legacy route catch-alls */}
            <Route path="dsa/*" element={<Navigate to="/concepts" replace />} />
            <Route path="p/*" element={<Navigate to="/concepts" replace />} />
            <Route path="lld/*" element={<Navigate to="/concepts" replace />} />
            <Route path="hld/*" element={<Navigate to="/concepts" replace />} />
            <Route path="behavioral/*" element={<Navigate to="/concepts" replace />} />
            <Route path="library" element={<Navigate to="/concepts" replace />} />
            <Route path="library/*" element={<Navigate to="/concepts" replace />} />
            <Route path="vibe-learning" element={<Navigate to="/playground" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
