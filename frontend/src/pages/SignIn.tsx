import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'google_auth_failed':
          setError('Google authentication failed. Please try again.');
          break;
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'callback_failed':
          setError('Authentication callback failed. Please try again.');
          break;
        default:
          setError('An error occurred during authentication.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await signin(email, password);
      if (success) {
        navigate('/home');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-2xl backdrop-blur-sm">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Sign In</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 px-3 py-3 rounded-lg border border-red-200 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative text-center my-5">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
          <span className="relative bg-white px-4 text-gray-500 text-sm">or</span>
        </div>

        <GoogleSignInButton />

        <p className="text-center mt-5 text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-500 no-underline font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
