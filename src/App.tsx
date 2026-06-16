import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import { useAuth } from './contexts/AuthContext';
import { trackReturned, trackSignup } from './lib/analytics';

// Session-level analytics. The app is usable as a guest, so `signup` means
// "first ever session on this browser" and `returned` means a later session.
const SEEN_KEY = 'swe-interview-prep:seen';

const Learn = lazy(() => import('./pages/Learn'));
const LearnAll = lazy(() => import('./pages/LearnAll'));
const Practice = lazy(() => import('./pages/Practice'));
const PracticeAll = lazy(() => import('./pages/PracticeAll'));
const Playground = lazy(() => import('./pages/Playground'));
const Progress = lazy(() => import('./pages/Progress'));
const ProgressAll = lazy(() => import('./pages/ProgressAll'));
const ConceptDetail = lazy(() => import('./pages/ConceptDetail'));
const RoadmapDetail = lazy(() => import('./pages/RoadmapDetail'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BuildLab = lazy(() => import('./pages/BuildLab'));
const LearningDoc = lazy(() => import('./pages/LearningDoc'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-sky-400" />
    </div>
  );
}

function App() {
  const { user, isGuest, loading } = useAuth();

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
              {/* Four-tab IA. Each tab lands on a minimal "what's next" page;
                  the rich browsable view is one click away at /<tab>/all. */}
              <Route index element={<Navigate to="/learn" replace />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/all" element={<LearnAll />} />
              <Route path="learn/:id" element={<ConceptDetail />} />
              <Route path="practice" element={<Practice />} />
              <Route path="practice/all" element={<PracticeAll />} />
              <Route path="playground" element={<Playground />} />
              <Route path="progress" element={<Progress />} />
              <Route path="progress/all" element={<ProgressAll />} />

              {/* Detail pages reachable from within the five tabs */}
              <Route path="concepts/:id" element={<ConceptDetail />} />
              <Route path="roadmaps/:id" element={<RoadmapDetail />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="build" element={<BuildLab />} />
              <Route path="drills/:id" element={<BuildLab />} />

              {/* Markdown deep-dive docs (Learning OS) */}
              <Route path="learning" element={<LearningDoc />} />
              <Route path="learning/:slug" element={<LearningDoc />} />

              {/* Static */}
              <Route path="about" element={<About />} />
              <Route path="privacy" element={<Privacy />} />

              {/* Legacy redirects — old 9-page IA */}
              <Route path="today" element={<Navigate to="/learn" replace />} />
              <Route path="dashboard" element={<Navigate to="/learn" replace />} />
              <Route path="roadmaps" element={<Navigate to="/learn" replace />} />
              <Route path="concepts" element={<Navigate to="/learn" replace />} />
              <Route path="drills" element={<Navigate to="/practice" replace />} />
              <Route path="reviews" element={<Navigate to="/practice?tab=reviews" replace />} />
              <Route path="review" element={<Navigate to="/practice?tab=reviews" replace />} />
              <Route path="projects" element={<Navigate to="/progress" replace />} />
              <Route path="notes" element={<Navigate to="/progress" replace />} />
              <Route path="library/*" element={<Navigate to="/learn" replace />} />
              <Route path="mock" element={<Navigate to="/practice" replace />} />
              <Route path="vibe-learning" element={<Navigate to="/playground" replace />} />
              <Route path="*" element={<Navigate to="/learn" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
