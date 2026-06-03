import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = ({ showToast }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    const result = await login(email, password);
    if (result.success) {
      showToast('Logged in successfully!', 'success');
    } else {
      setError(result.message || 'Invalid email or password');
      showToast(result.message || 'Invalid credentials', 'error');
    }
  };

  // Helper to autofill and login with admin seed data
  const handleAutoFill = () => {
    setEmail('admin@crm.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <ShieldCheck size={40} className="brand-logo-icon" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your client leads and pipeline</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="admin@crm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-login"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-autofill-panel">
          <p>Testing credentials preset:</p>
          <button onClick={handleAutoFill} className="btn btn-secondary w-full btn-autofill">
            <span>Autofill Admin Credentials</span>
          </button>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 24px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: var(--accent-gradient);
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
        }

        .brand-logo-icon {
          stroke: #ffffff;
        }

        .login-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input {
          padding-left: 46px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .w-full {
          width: 100%;
        }

        .btn-login {
          height: 48px;
          margin-top: 10px;
        }

        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-tertiary);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .login-divider:not(:empty)::before {
          margin-right: .5em;
        }

        .login-divider:not(:empty)::after {
          margin-left: .5em;
        }

        .login-autofill-panel {
          text-align: center;
        }

        .login-autofill-panel p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
          font-weight: 600;
        }

        .btn-autofill {
          height: 40px;
          border-style: dashed;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
