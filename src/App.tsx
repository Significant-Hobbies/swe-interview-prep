import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import { useAuth } from './contexts/AuthContext';
import { trackReturned, trackSignup } from './lib/analytics';
import { saasmaker } from './lib/saasmaker';

// Session-level analytics. The app is usable as a guest, so `signup` means
// "first ever session on this browser" and `returned` means a later session.
const SEEN_KEY = 'swe-interview-prep:seen';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Roadmaps = lazy(() => import('./pages/Roadmaps'));
const RoadmapDetail = lazy(() => import('./pages/RoadmapDetail'));
const Concepts = lazy(() => import('./pages/Concepts'));
const ConceptDetail = lazy(() => import('./pages/ConceptDetail'));
const Drills = lazy(() => import('./pages/Drills'));
const BuildLab = lazy(() => import('./pages/BuildLab'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Notes = lazy(() => import('./pages/Notes'));
const Progress = lazy(() => import('./pages/Progress'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Playground = lazy(() => import('./pages/Playground'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-purple-400" />
    </div>
  );
}

function App() {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    saasmaker.analytics.track({ name: 'page_view', url: location.pathname }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) {
        trackReturned();
      } else {
        localStorage.setItem(SEEN_KEY, '1');
        trackSignup();
      }
    } catch {
      // localStorage unavailable — skip session attribution silently.
    }
  }, []);

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
      <ErrorBoundary scope="route">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="roadmaps" element={<Roadmaps />} />
              <Route path="roadmaps/:id" element={<RoadmapDetail />} />
              <Route path="concepts" element={<Concepts />} />
              <Route path="concepts/:id" element={<ConceptDetail />} />
              <Route path="drills" element={<Drills />} />
              <Route path="drills/:id" element={<BuildLab />} />
              <Route path="build" element={<BuildLab />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="notes" element={<Notes />} />
              <Route path="progress" element={<Progress />} />
              <Route path="mock" element={<MockInterview />} />
              <Route path="playground" element={<Playground />} />
              <Route path="about" element={<About />} />
              <Route path="privacy" element={<Privacy />} />
              {/* Legacy route redirects */}
              <Route path="today" element={<Navigate to="/" replace />} />
              <Route path="review" element={<Navigate to="/reviews" replace />} />
              <Route path="dsa/*" element={<Navigate to="/concepts" replace />} />
              <Route path="p/*" element={<Navigate to="/concepts" replace />} />
              <Route path="lld/*" element={<Navigate to="/concepts" replace />} />
              <Route path="hld/*" element={<Navigate to="/concepts" replace />} />
              <Route path="behavioral/*" element={<Navigate to="/concepts" replace />} />
              <Route path="library/*" element={<Navigate to="/concepts" replace />} />
              <Route path="vibe-learning" element={<Navigate to="/build" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
