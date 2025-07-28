import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/authentication/SignIn';
import SignUp from './pages/authentication/SignUp';
import Home from './pages/general/Home';
import NotFound from './pages/static/NotFound';
import CreateGig from './pages/gigs/CreateGig';
import Profile from './pages/profile/Profile';
import GoogleCallback from './pages/authentication/GoogleCallback';
import CompleteProfile from './pages/profile/CompleteProfile';
import LandingPage from './pages/general/LandingPage';
import Gigs from './pages/gigs/Gigs';
import GigDetail from './pages/gigs/GigDetail';
import PrivacyPolicy from './pages/static/PrivacyPolicy';
import TermsAndConditions from './pages/static/TermsAndConditions';
import Contact from './pages/static/Contact';
import Messages from './pages/messaging/Messages';
import MyGigs from './pages/gigs/MyGigs';
import EditGig from './pages/gigs/EditGig';
import PurchasedGigs from './pages/marketplace/PurchasedGigs';
import Sales from './pages/marketplace/Sales';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <AuthProvider>
        <Router>
          <div className="min-h-screen no-scrollbar">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gigs/new"
                element={
                  <ProtectedRoute>
                    <CreateGig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gigs"
                element={
                  <ProtectedRoute>
                    <Gigs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gigs/:id"
                element={
                  <ProtectedRoute>
                    <GigDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route
                path="/my-gigs"
                element={
                  <ProtectedRoute>
                    <MyGigs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gigs/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditGig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchased-gigs"
                element={
                  <ProtectedRoute>
                    <PurchasedGigs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
