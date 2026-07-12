import API_BASE_URL from '../config/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return;
      }
      if (name.length > 50) {
        setError('Name must not exceed 50 characters');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mode !== 'reset' && !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (email.length > 100) {
      setError('Email must not exceed 100 characters');
      return;
    }

    if (mode === 'register' || mode === 'reset') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password.length > 24) {
        setError('Password must not exceed 24 characters');
        return;
      }
    }

    if (mode === 'login') {
      if (password.length < 1) {
        setError('Password is required');
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      if (mode === 'login') {
        endpoint = '/api/users/login';
        payload = { email: email.toLowerCase().trim(), password };
      } else if (mode === 'register') {
        endpoint = '/api/users/register';
        payload = { name, email: email.toLowerCase().trim(), password };
      } else if (mode === 'forgot') {
        endpoint = '/api/users/forgot-password';
        payload = { email: email.toLowerCase().trim() };
      } else if (mode === 'reset') {
        endpoint = '/api/users/reset-password';
        payload = { email: email.toLowerCase().trim(), password };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Action failed');
      }

      if (mode === 'login') {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/dashboard');
      } else if (mode === 'register') {
        setSuccess('Registration successful! Please sign in.');
        setMode('login');
        setPassword('');
      } else if (mode === 'forgot') {
        setSuccess('A recovery request has been processed. Please enter your new password below to reset.');
        setMode('reset');
        setPassword('');
      } else if (mode === 'reset') {
        setSuccess('Password reset successful! Please sign in with your new password.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-md bg-ink-deep border border-hairline-violet rounded-lg p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain rounded-full bg-primary/40 border border-hairline-violet p-1.5 mb-2" />
          <h2 className="text-2xl font-bold text-white tracking-tight">AssetFlow</h2>
          <p className="text-sm text-on-dark-muted mt-1 text-center">
            Enterprise Asset & Resource Management System
          </p>
        </div>

        {/* Auth Mode switcher */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-hairline-violet mb-6">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${mode === 'login' ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${mode === 'register' ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
                }`}
            >
              Create Account
            </button>
          </div>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <div className="mb-6 text-center">
            <h3 className="text-md font-bold text-white uppercase tracking-wider">
              {mode === 'forgot' ? 'Recover Password' : 'Set New Password'}
            </h3>
            <p className="text-xs text-on-dark-muted mt-1">
              {mode === 'forgot' 
                ? 'Enter your email to verify your account and set a new password.' 
                : `Resetting password for ${email}`}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                maxLength={50}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                required
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                maxLength={100}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                required
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-on-dark-muted uppercase">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-accent-violet hover:underline focus:outline-none bg-transparent border-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                maxLength={100}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-lime text-primary font-bold py-3 rounded text-sm transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' : 
              mode === 'register' ? 'Create Account' : 
              mode === 'forgot' ? 'Send Recovery Request' : 'Reset Password'
            )}
          </button>

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className="w-full text-xs text-on-dark-muted hover:text-white transition-colors text-center mt-2 focus:outline-none"
            >
              ← Back to Sign In
            </button>
          )}
        </form>

        <div className="mt-6 border-t border-hairline-violet pt-6 text-center">
          <p className="text-xs text-on-dark-muted leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your dashboard, book assets, or file requests.'
              : mode === 'register'
              ? 'Signup registers an employee account. Elevated management roles must be granted by administrators.'
              : 'Password recovery processes requests securely for active registered organization accounts.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
