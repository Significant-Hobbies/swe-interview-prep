import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import { useAuth } from './contexts/AuthContext';
import { trackReturned, trackSignup } from './lib/analytics';
import { loadLocal, STORE_KEYS } from './lib/userStore';

const SEEN_KEY = 'swe-interview-prep:seen';

const Today = lazy(() => import('./pages/Today'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PublicRoadmap = lazy(() => import('./pages/PublicRoadmap'));
const Learn = lazy(() => import('./pages/Learn'));
const LearnAll = lazy(() => import('./pages/LearnAll'));
const Explore = lazy(() => import('./pages/Explore'));
const Practice = lazy(() => import('./pages/Practice'));
const PracticeAll = lazy(() => import('./pages/PracticeAll'));
const Playground = lazy(() => import('./pages/Playground'));
const Progress = lazy(() => import('./pages/Progress'));
const ProgressAll = lazy(() => import('./pages/ProgressAll'));
const ConceptDetail = lazy(() => import('./pages/ConceptDetail'));
const RoadmapDetail = lazy(() => import('./pages/RoadmapDetail'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BuildLab = lazy(() => import('./pages/BuildLab'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const LearningDoc = lazy(() => import('./pages/LearningDoc'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));

function removeLcpShell() {
  document.getElementById('lcp-shell')?.remove();
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const done = loadLocal<{ done?: boolean }>(STORE_KEYS.onboarding, {}).done;
  // Onboarding is optional — only redirect away once already completed.
  if (done && location.pathname === '/onboarding') {
    return <Navigate to="/today" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/share/roadmaps/:id" element={<PublicRoadmap />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<Today />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/all" element={<LearnAll />} />
        <Route path="explore" element={<Explore />} />
        <Route path="learn/:id" element={<ConceptDetail />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/all" element={<PracticeAll />} />
        <Route path="playground" element={<Playground />} />
        <Route path="progress" element={<Progress />} />
        <Route path="progress/all" element={<ProgressAll />} />
        <Route path="concepts/:id" element={<ConceptDetail />} />
        <Route path="roadmaps/:id" element={<RoadmapDetail />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="build" element={<BuildLab />} />
        <Route path="drills/:id" element={<BuildLab />} />
        <Route path="learning" element={<LearningDoc />} />
        <Route path="learning/:slug" element={<LearningDoc />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="dashboard" element={<Navigate to="/today" replace />} />
        <Route path="roadmaps" element={<Navigate to="/learn" replace />} />
        <Route path="concepts" element={<Navigate to="/learn/all" replace />} />
        <Route path="drills" element={<Navigate to="/practice" replace />} />
        <Route path="reviews" element={<Navigate to="/practice/all?tab=reviews" replace />} />
        <Route path="review" element={<Navigate to="/practice/all?tab=reviews" replace />} />
        <Route path="projects" element={<Navigate to="/progress/all" replace />} />
        <Route path="notes" element={<Navigate to="/progress/all?tab=notes" replace />} />
        <Route path="library/*" element={<Navigate to="/learn" replace />} />
        <Route path="mock" element={<MockInterview />} />
        <Route path="vibe-learning" element={<Navigate to="/playground" replace />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();
  const isPublicShare = location.pathname.startsWith('/share/');

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) trackReturned();
      else {
        localStorage.setItem(SEEN_KEY, '1');
        trackSignup();
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!loading && (user || isGuest)) removeLcpShell();
  }, [loading, user, isGuest]);

  if (loading) return null;

  if (!user && !isGuest && !isPublicShare) {
    return (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    );
  }

  const body = isPublicShare ? (
    <AppRoutes />
  ) : (
    <OnboardingGate>
      <AppRoutes />
    </OnboardingGate>
  );

  return (
    <>
      {!isPublicShare && <SaaSMakerFeedback />}
      <ErrorBoundary scope="route">
        <Suspense fallback={null}>{body}</Suspense>
      </ErrorBoundary>
    </>
  );
}