import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
    if (!isLogin) {
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
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (email.length > 100) {
      setError('Email must not exceed 100 characters');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password.length > 24) {
        setError('Password must not exceed 24 characters');
        return;
      }
    }

    if (isLogin) {
      if (password.length < 1) {
        setError('Password is required');
        return;
      }
      if (password.length > 24) {
        setError('Password must not exceed 24 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const payload = isLogin
        ? { email: email.toLowerCase().trim(), password }
        : { name, email: email.toLowerCase().trim(), password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
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
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/dashboard');
      } else {
        setSuccess('Registration successful! Please sign in.');
        setIsLogin(true);
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
          <div className="w-12 h-12 rounded bg-accent-lime flex items-center justify-center text-primary font-bold text-2xl mb-2">
            AF
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AssetFlow</h2>
          <p className="text-sm text-on-dark-muted mt-1 text-center">
            Enterprise Asset & Resource Management System
          </p>
        </div>

        {/* Auth Mode switcher */}
        <div className="flex border-b border-hairline-violet mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${isLogin ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${!isLogin ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
              }`}
          >
            Create Account
          </button>
        </div>

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
          {!isLogin && (
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-on-dark-muted uppercase">
                Password
              </label>
              {isLogin && (
                <a href="#forgot" className="text-xs text-accent-violet hover:underline">
                  Forgot password?
                </a>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-3 rounded text-sm transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 border-t border-hairline-violet pt-6 text-center">
          <p className="text-xs text-on-dark-muted leading-relaxed">
            {isLogin
              ? 'Sign in to access your dashboard, book assets, or file requests.'
              : 'Signup registers an employee account. Elevated management roles must be granted by administrators.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
