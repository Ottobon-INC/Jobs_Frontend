import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/Layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/constants';
import Loader from './components/ui/Loader';
import { useAuth } from './hooks/useAuth';
import { FloatingNewGradWidget } from './components/new-grad/FloatingNewGradWidget';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));

// Seeker Pages
const JobFeedPage = lazy(() => import('./pages/seeker/JobFeedPage'));
const JobDetailPage = lazy(() => import('./pages/seeker/JobDetailPage'));
const MatchPage = lazy(() => import('./pages/seeker/MatchPage'));
const TailorResumePage = lazy(() => import('./pages/seeker/TailorResumePage'));
const ProfilePage = lazy(() => import('./pages/seeker/ProfilePage'));
const SavedJobsPage = lazy(() => import('./pages/seeker/SavedJobsPage'));
const CoursesPage = lazy(() => import('./pages/seeker/CoursesPage'));
const MockInterviewPage = lazy(() => import('./pages/seeker/MockInterviewPage'));
const InterviewReviewsPage = lazy(() => import('./pages/seeker/InterviewReviewsPage'));
const FeedbackPage = lazy(() => import('./pages/seeker/FeedbackPage'));
const InterviewMaterialsPage = lazy(() => import('./pages/seeker/InterviewMaterialsPage'));
const MaterialViewPage = lazy(() => import('./pages/seeker/MaterialViewPage'));
const JobsAIPage = lazy(() => import('./pages/seeker/JobsAIPage'));

// Provider Pages
const CreateJobPage = lazy(() => import('./pages/provider/CreateJobPage'));
const MyListingsPage = lazy(() => import('./pages/provider/MyListingsPage'));

// Admin Pages
const ControlTowerPage = lazy(() => import('./pages/admin/ControlTowerPage'));
const IngestionPage = lazy(() => import('./pages/admin/IngestionPage'));
const HelpDeskPage = lazy(() => import('./pages/admin/HelpDeskPage'));
const AdminInterviewReviewsPage = lazy(() => import('./pages/admin/InterviewReviewsPage'));
const FeedbackDashboard = lazy(() => import('./pages/admin/FeedbackDashboard'));
const AddInterviewMaterialsPage = lazy(() => import('./pages/admin/AddInterviewMaterialsPage'));
const ManagePlaybooksPage = lazy(() => import('./pages/admin/ManagePlaybooksPage'));
const EditPlaybookPage = lazy(() => import('./pages/admin/EditPlaybookPage'));

// Chat
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));

// Shared
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const BlogLandingPage = lazy(() => import('./pages/public/BlogLandingPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));
const MarketPage = lazy(() => import('./pages/provider/MarketPage'));

// Landing Page
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const NewGradPage = lazy(() => import('./pages/public/NewGradPage'));
const NewGradDetailPage = lazy(() => import('./pages/public/NewGradDetailPage'));
const HiringTimelinePage = lazy(() => import('./pages/public/HiringTimelinePage'));

const GlobalWidgets = () => {
  const { isAuthenticated } = useAuth();
  return <FloatingNewGradWidget isAuthenticated={isAuthenticated} />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <GlobalWidgets />
          <Suspense fallback={<Loader fullScreen variant="logo" />}>
            <Routes>
              {/* Landing Page — standalone, outside AppShell */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/new-grad" element={<NewGradPage />} />
              <Route path="/new-grad/timeline" element={<HiringTimelinePage />} />
              <Route path="/new-grad/:slug" element={<NewGradDetailPage />} />

              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Routes wrapped in AppShell */}
              <Route element={<AppShell />}>

                {/* Public but with AppShell */}
                <Route path="/blogs" element={<BlogLandingPage />} />
                <Route path="/blogs/:slug" element={<BlogPostPage />} />

                {/* Protected Routes */}
                <Route path="/market-intelligence" element={
                  <ProtectedRoute>
                    <MarketPage />
                  </ProtectedRoute>
                } />

                <Route path="/jobs" element={<JobFeedPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />

                {/* Protected: Seeker Only */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.SEEKER]} />}>
                  <Route path="/jobs/:id/match" element={<MatchPage />} />
                  <Route path="/jobs/:id/tailor" element={<TailorResumePage />} />
                  <Route path="/jobs/:id/mock-interview" element={<MockInterviewPage />} />
                  <Route path="/mock-interview" element={<MockInterviewPage />} />
                  <Route path="/interview-reviews" element={<InterviewReviewsPage />} />
                  <Route path="/saved" element={<SavedJobsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/materials" element={<InterviewMaterialsPage />} />
                  <Route path="/jobs-ai" element={<JobsAIPage />} />
                </Route>

                {/* Protected: Provider Only */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.PROVIDER]} />}>
                  <Route path="/provider/create" element={<CreateJobPage />} />
                  <Route path="/provider/listings" element={<MyListingsPage />} />
                </Route>

                {/* Protected: Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                  <Route path="/admin/tower" element={<ControlTowerPage />} />
                  <Route path="/admin/ingest" element={<IngestionPage />} />
                  <Route path="/admin/helpdesk" element={<HelpDeskPage />} />
                  <Route path="/admin/interview-reviews" element={<AdminInterviewReviewsPage />} />
                  <Route path="/admin/feedback" element={<FeedbackDashboard />} />
                  <Route path="/admin/add-data" element={<AddInterviewMaterialsPage />} />
                  <Route path="/admin/playbooks" element={<ManagePlaybooksPage />} />
                  <Route path="/admin/playbooks/create" element={<EditPlaybookPage />} />
                  <Route path="/admin/playbooks/edit/:id" element={<EditPlaybookPage />} />
                </Route>

              </Route>

              {/* Standalone Protected Routes (No AppShell) */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.SEEKER]} />}>
                <Route path="/materials/view/:id" element={<MaterialViewPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
