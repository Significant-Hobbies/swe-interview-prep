import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { SaaSMakerFeedback } from './components/saasmaker-feedback';
import { useAuth } from './contexts/AuthContext';
import { trackPageView, trackReturned, trackSignup } from './lib/analytics';
import { focusedRoute } from './lib/focusedRoute';
import { removeLcpShell } from './lib/lcpShell';
import { loadLocal, STORE_KEYS } from './lib/userStore';

const SEEN_KEY = 'swe-interview-prep:seen';

function RouteLoading() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white/50" aria-busy="true">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-3 w-28 bg-white/10" />
        <div className="mt-5 h-9 w-64 max-w-full bg-white/10" />
        <div className="mt-10 h-px bg-white/10" />
      </div>
    </main>
  );
}

const loadDashboard = () => import('./pages/Today');

// Dashboard is the default workspace. Start its module graph with the entry bundle
// so the headline does not wait for the router's first lazy-import waterfall.
if (
  window.location.pathname === '/' ||
  window.location.pathname === '/dashboard' ||
  window.location.pathname === '/today'
) {
  void loadDashboard();
}

const Today = lazy(loadDashboard);
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PublicRoadmap = lazy(() => import('./pages/PublicRoadmap'));
const Learn = lazy(() => import('./pages/Learn'));
const LearnAll = lazy(() => import('./pages/LearnAll'));
const RoleFit = lazy(() => import('./pages/RoleFit'));
const InferencePath = lazy(() => import('./pages/InferencePath'));
const NotationReference = lazy(() => import('./pages/NotationReference'));
const KnowledgeMap = lazy(() => import('./pages/KnowledgeMap'));
const PaperProgramme = lazy(() => import('./pages/PaperProgramme'));
const FocusedStudy = lazy(() => import('./pages/FocusedStudy'));
const Explore = lazy(() => import('./pages/Explore'));
const Sweep = lazy(() => import('./pages/Sweep'));
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
const LearningSources = lazy(() => import('./pages/LearningSources'));
const LearningSourceDetail = lazy(() => import('./pages/LearningSourceDetail'));
const DailyLearningSession = lazy(() => import('./pages/DailyLearningSession'));
const Library = lazy(() => import('./pages/Library'));
const RepoView = lazy(() => import('./pages/RepoView'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Changelog = lazy(() => import('./pages/Changelog'));
const Login = lazy(() => import('./pages/Login'));
const SystemsLabs = lazy(() => import('./pages/SystemsLabs'));
const SystemsLabRunner = lazy(() => import('./pages/SystemsLabRunner'));
const DecisionLab = lazy(() => import('./pages/DecisionLab'));
const SoftwareWars = lazy(() => import('./pages/SoftwareWars'));
const BlitzWar = lazy(() => import('./pages/BlitzWar'));
const TradeoffWar = lazy(() => import('./pages/TradeoffWar'));
const WarChallenge = lazy(() =>
  import('./pages/WarPublic').then((module) => ({ default: module.WarChallenge }))
);
const WarResult = lazy(() =>
  import('./pages/WarPublic').then((module) => ({ default: module.WarResult }))
);

function AppReady({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // The root route redirects to Today. Keep the initial-response shell in
    // place until that lazy destination has committed, not merely until auth
    // has finished or the entry bundle has started executing.
    if (location.pathname !== '/') removeLcpShell();
  }, [location.pathname]);

  return <>{children}</>;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const done = loadLocal<{ done?: boolean }>(STORE_KEYS.onboarding, {}).done;
  // Onboarding is optional — only redirect away once already completed.
  if (done && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/share/roadmaps/:id" element={<PublicRoadmap />} />
      {/* Outside <Layout> on purpose. Login renders its own SiteHeader, so
          nesting it under Layout stacked two identical navbars — the landing
          page showed header, digest strip, setup strip, then a second header. */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Today />} />
        <Route path="today" element={<Navigate to="/dashboard" replace />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/all" element={<LearnAll />} />
        <Route path="learn/role-fit" element={<RoleFit />} />
        <Route path="learn/inference" element={<InferencePath />} />
        <Route path="learn/notation" element={<NotationReference />} />
        <Route path="learn/map/:conceptId" element={<KnowledgeMap />} />
        <Route path="learn/papers" element={<PaperProgramme />} />
        <Route path="study/:focusKind/:focusId" element={<FocusedStudy />} />
        <Route path="explore" element={<Explore />} />
        <Route path="sweep" element={<Sweep />} />
        <Route path="learn/:id" element={<ConceptDetail />} />
        <Route path="practice" element={<Playground />} />
        <Route path="practice/all" element={<PracticeAll />} />
        <Route path="playground" element={<Playground />} />
        <Route path="progress" element={<Progress />} />
        <Route path="progress/all" element={<ProgressAll />} />
        <Route path="concepts/:id" element={<ConceptDetail />} />
        <Route path="roadmaps/:id" element={<RoadmapDetail />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="build" element={<BuildLab />} />
        <Route path="labs" element={<SystemsLabs />} />
        <Route path="labs/decision/:labId" element={<DecisionLab />} />
        <Route path="labs/:labId" element={<SystemsLabRunner />} />
        <Route path="drills/:id" element={<BuildLab />} />
        <Route path="learning" element={<LearningDoc />} />
        <Route path="learning/:slug" element={<LearningDoc />} />
        {/* Open, like every other route. Nothing here is personal: the sources
            feed and the library are generated/vendored content committed to the
            repo, and session progress is local until you sign in. */}
        <Route path="sources" element={<LearningSources />} />
        <Route path="sources/:id" element={<LearningSourceDetail />} />
        <Route path="session/:date" element={<DailyLearningSession />} />
        <Route path="session/:date/:sessionId" element={<DailyLearningSession />} />
        <Route path="library" element={<Library />} />
        <Route path="library/:repoSlug" element={<RepoView />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="roadmaps" element={<Navigate to="/learn" replace />} />
        <Route path="concepts" element={<Navigate to="/learn/all" replace />} />
        <Route path="drills" element={<Navigate to="/practice/all" replace />} />
        <Route path="reviews" element={<Navigate to="/practice/all?tab=reviews" replace />} />
        <Route path="review" element={<Navigate to="/practice/all?tab=reviews" replace />} />
        <Route path="projects" element={<Navigate to="/progress/all" replace />} />
        <Route path="notes" element={<Navigate to="/progress/all?tab=notes" replace />} />
        <Route path="mock" element={<MockInterview />} />
        <Route path="wars" element={<SoftwareWars />} />
        <Route path="wars/blitz" element={<BlitzWar />} />
        <Route path="wars/blitz/:matchId" element={<BlitzWar />} />
        <Route path="wars/tradeoff" element={<TradeoffWar />} />
        <Route path="wars/tradeoff/:matchId" element={<TradeoffWar />} />
        <Route path="wars/challenge/:token" element={<WarChallenge />} />
        <Route path="wars/results/:slug" element={<WarResult />} />
        <Route path="vibe-learning" element={<Navigate to="/playground" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { user, isGuest, loading, continueAsGuest } = useAuth();
  const location = useLocation();
  const isPublicShare = location.pathname.startsWith('/share/');
  const isFocused = focusedRoute(location.pathname) !== null;

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

  // Manually track page_view on every route change. PostHog's built-in
  // capture_pageview is disabled (see foundry-monitoring.ts) so we can attach
  // the project_id property to every page view.
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  /**
   * Nobody is asked to sign in to use this.
   *
   * A visitor with no session is put straight into guest mode rather than shown
   * a login screen. Signing in buys one thing — progress that survives the
   * browser — so it belongs in the header as an upgrade, not in the doorway as
   * a toll. The pitch page is still reachable at `/login` for anyone who wants
   * it; it is no longer a gate.
   */
  useEffect(() => {
    if (!loading && !user && !isGuest) continueAsGuest();
  }, [loading, user, isGuest, continueAsGuest]);

  if (loading && !user && !isGuest) return <RouteLoading />;

  const body = isPublicShare ? (
    <AppRoutes />
  ) : (
    <OnboardingGate>
      <AppRoutes />
    </OnboardingGate>
  );

  return (
    <>
      {/* AppReady sits OUTSIDE the boundary on purpose. It used to be inside,
          so a route chunk that failed to load took the shell-removal with it:
          the error screen rendered in #root while the fixed LCP shell stayed
          painted on top, and the visitor just kept staring at the loading
          shell with no sign anything had gone wrong. */}
      <AppReady>
        <ErrorBoundary scope="route">
          <Suspense fallback={<RouteLoading />}>{body}</Suspense>
        </ErrorBoundary>
      </AppReady>
      {!isPublicShare && !isFocused && <SaaSMakerFeedback />}
    </>
  );
}
