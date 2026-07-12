import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, redirect to dashboard as mockup behavior
    navigate('/dashboard');
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
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              isLogin ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              !isLogin ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

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
              className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-3 rounded text-sm transition-colors mt-6"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
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
