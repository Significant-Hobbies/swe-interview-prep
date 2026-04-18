import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { saasmaker } from './lib/saasmaker';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import Layout from './components/Layout';
import Today from './pages/Today';
import Concepts from './pages/Concepts';
import Review from './pages/Review';
import Playground from './pages/Playground';
import Login from './pages/Login';

function App() {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    saasmaker.analytics.track({ name: 'page_view', url: location.pathname }).catch(() => {});
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-400" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Login />;
  }

  return (
    <>
      <SaaSMakerFeedback />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="concepts" element={<Concepts />} />
          <Route path="review" element={<Review />} />
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
    </>
  );
}

export default App;
