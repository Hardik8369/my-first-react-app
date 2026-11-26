import { useEffect, useRef, useState } from 'react'
import {
  getCurrentUser,
  loginUser,
  signupUser,
  logoutUser,
  sendRecoveryEmail,
  resetPassword,
} from './appwrite.js'

// Password box with the show/hide eye
const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={8}
        className="w-full px-3 py-2 pr-11 rounded-md bg-white/10 outline-none"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer"
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}

// Profile icon at the top right with a dropdown card (user details + logout)
const ProfileMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user.name || user.email;
  const initial = displayName.charAt(0).toUpperCase();
  const joined = user.$createdAt
    ? new Date(user.$createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // Close the dropdown when clicking outside of it or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="fixed top-4 right-4 z-50 text-white">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open profile menu"
        className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 font-bold text-lg flex items-center justify-center cursor-pointer"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0f0d23] border border-white/10 shadow-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-500 font-bold text-xl flex items-center justify-center">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="font-semibold truncate">{user.name || 'User'}</p>
              <p className="text-sm text-gray-300 truncate">{user.email}</p>
            </div>
          </div>

          {joined && (
            <p className="text-xs text-gray-400">Member since {joined}</p>
          )}

          <hr className="border-white/10" />

          <button
            onClick={onLogout}
            className="w-full py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

const AuthGate = ({ children }) => {
  // If the page was opened from the reset email, the URL has userId and secret
  const [recovery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const secret = params.get('secret');
    return userId && secret ? { userId, secret } : null;
  });

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // mode can be: 'login', 'signup', 'forgot', 'reset'
  const [mode, setMode] = useState(recovery ? 'reset' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // On first load, check if the visitor already has a logged-in session
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setChecking(false));
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        setUser(await loginUser(email, password));
      } else if (mode === 'signup') {
        setUser(await signupUser(name, email, password));
      } else if (mode === 'forgot') {
        await sendRecoveryEmail(email);
        setMessage('Reset link sent. Check your inbox (and the spam folder).');
      } else if (mode === 'reset') {
        await resetPassword(recovery.userId, recovery.secret, password);

        // Remove userId and secret from the address bar
        window.history.replaceState({}, '', window.location.pathname);

        setPassword('');
        setMode('login');
        setMessage('Password updated. Please login with your new password.');
      }
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
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Logged in: show the real app, plus the profile icon
  // (not while the visitor is resetting a password from the email link)
  if (user && mode !== 'reset') {
    return (
      <>
        <ProfileMenu user={user} onLogout={handleLogout} />

        {children}
      </>
    );
  }

  const titles = {
    login: 'Login',
    signup: 'Create account',
    forgot: 'Forgot password',
    reset: 'Set new password',
  };

  const buttonLabels = {
    login: 'Login',
    signup: 'Sign up',
    forgot: 'Send reset link',
    reset: 'Update password',
  };

  // Not logged in: show the login / signup / forgot / reset form
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/5 rounded-xl p-6 flex flex-col gap-4 text-white"
      >
        <h1 className="text-2xl font-bold text-center">{titles[mode]}</h1>

        {mode === 'forgot' && (
          <p className="text-sm text-gray-300 text-center">
            Enter your email and we will send you a link to reset your password.
          </p>
        )}

        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-3 py-2 rounded-md bg-white/10 outline-none"
          />
        )}

        {mode !== 'reset' && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-md bg-white/10 outline-none"
          />
        )}

        {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'reset' ? 'New password (min 8 characters)' : 'Password (min 8 characters)'}
          />
        )}

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="text-sm text-indigo-400 underline self-end cursor-pointer"
          >
            Forgot password?
          </button>
        )}

        {message && <p className="text-green-400 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Please wait...' : buttonLabels[mode]}
        </button>

        {mode === 'login' && (
          <p className="text-sm text-center text-gray-300">
            Don't have an account?{' '}
            <button type="button" onClick={() => switchMode('signup')} className="text-indigo-400 underline cursor-pointer">
              Sign up
            </button>
          </p>
        )}

        {mode === 'signup' && (
          <p className="text-sm text-center text-gray-300">
            Already have an account?{' '}
            <button type="button" onClick={() => switchMode('login')} className="text-indigo-400 underline cursor-pointer">
              Login
            </button>
          </p>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <button
            type="button"
            onClick={() => {
              if (mode === 'reset') {
                window.history.replaceState({}, '', window.location.pathname);
              }
              switchMode('login');
            }}
            className="text-sm text-indigo-400 underline cursor-pointer"
          >
            Back to login
          </button>
        )}
      </form>
    </div>
  )
}

export default AuthGate