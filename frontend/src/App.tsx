import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import CreateGig from './pages/CreateGig';
import Profile from './pages/Profile';
import GoogleCallback from './pages/GoogleCallback';
import CompleteProfile from './pages/CompleteProfile';
import LandingPage from './pages/LandingPage';
import Gigs from './pages/Gigs';
import GigDetail from './pages/GigDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
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
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
