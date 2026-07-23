import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuthStore } from './store/useAuthStore';
import { useSubscriptionStore } from './store/useSubscriptionStore';
import { ThemeProvider } from './hooks/useTheme';
import { pageTransitionPro } from './lib/motion';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CourseEditorPage = lazy(() => import('./pages/CourseEditorPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-base">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-accent-cyan/30 border-b-accent-cyan rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

// Ambient colorful blurred blobs behind every page
const AmbientBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-brand/20 dark:bg-brand/25 blur-[120px] animate-float-slow" />
    <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent-cyan/15 dark:bg-accent-cyan/20 blur-[120px] animate-float-slow" style={{ animationDelay: '-3s' }} />
    <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-accent-rose/10 dark:bg-accent-rose/15 blur-[130px] animate-float-slow" style={{ animationDelay: '-6s' }} />
    <div className="noise-overlay" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransitionPro}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/module/:moduleId" element={<LessonPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          <Route path="/admin/courses/new" element={
            <AdminRoute>
              <CourseEditorPage />
            </AdminRoute>
          } />
          <Route path="/admin/courses/:courseId" element={
            <AdminRoute>
              <CourseEditorPage />
            </AdminRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  const { loading, initializeUser, user } = useAuthStore();
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    fetchSubscription(user?.id);
  }, [user?.id, fetchSubscription]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <div className="min-h-screen bg-base text-content font-sans">
            <AmbientBackground />
            <Navbar />
            <main className="flex-grow pt-16">
              <Suspense fallback={<PageLoader />}>
                <AnimatedRoutes />
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
