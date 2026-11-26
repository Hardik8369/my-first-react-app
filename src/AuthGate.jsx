import { useEffect, useState } from 'react'
import { getCurrentUser, loginUser, signupUser, logoutUser } from './appwrite.js'

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // On first load, check if the visitor already has a logged-in session
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = isSignup
        ? await signupUser(name, email, password)
        : await loginUser(email, password);

      setUser(loggedInUser);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setPassword('');
    setShowPassword(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Logged in: show the real app, plus a logout button
  if (user) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 text-white">
          <span className="text-sm">Hi, {user.name || user.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>

        {children}
      </>
    );
  }

  // Not logged in: show the login / signup form
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/5 rounded-xl p-6 flex flex-col gap-4 text-white"
      >
        <h1 className="text-2xl font-bold text-center">
          {isSignup ? 'Create account' : 'Login'}
        </h1>

        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-3 py-2 rounded-md bg-white/10 outline-none"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 rounded-md bg-white/10 outline-none"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 pr-11 rounded-md bg-white/10 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer"
          >
            {showPassword ? (
              // Eye with a slash: password is visible, click to hide
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Open eye: password is hidden, click to show
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Login'}
        </button>

        <p className="text-sm text-center text-gray-300">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-indigo-400 underline cursor-pointer"
          >
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  )
}

export default AuthGate