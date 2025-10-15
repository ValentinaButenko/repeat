'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeSlash, Lock } from '@phosphor-icons/react';

/**
 * Simple password protection login page
 * 
 * Only shown when APP_ACCESS_PASSWORD environment variable is set
 */
export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Password is correct, cookie is set, redirect to home
        router.push('/');
        router.refresh();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mx-[360px]" style={{ background: '#E8E2D9' }}>
      <div className="w-full" style={{ maxWidth: '1200px' }}>
        <div className="rounded-[20px] p-16 flex items-center gap-24" style={{ background: 'rgba(255, 255, 255, 0.4)', height: '800px' }}>
          {/* Left side - Form */}
          <div className="flex flex-col justify-center flex-1">
            {/* Title */}
            <h1 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 600, 
                fontSize: '48px',
                color: '#1C1D17',
                marginBottom: '16px'
              }}
            >
              Log in to Repeat
            </h1>
            
            <p 
              className="m-0"
              style={{ 
                fontFamily: 'var(--font-bitter)', 
                fontWeight: 400, 
                fontSize: '20px',
                color: '#5B5B55',
                marginBottom: '40px'
              }}
            >
              Enter password to access the app
            </p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Password Input */}
            <div style={{ width: '400px' }}>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#5B5B55' }}>
                  <Lock size={20} weight="regular" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error when user types
                  }}
                  className="w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:border-[#1C1D17] transition-colors duration-200 placeholder:text-[#5B5B55]"
                  style={{ 
                    fontFamily: 'var(--font-bitter)', 
                    fontWeight: 400, 
                    fontSize: '18px',
                    color: '#1C1D17',
                    backgroundColor: '#FFFFFF',
                    borderColor: error ? '#EE683F' : '#E8E2D9',
                    height: '52px'
                  }}
                  placeholder="password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#5B5B55' }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlash size={20} weight="regular" />
                  ) : (
                    <Eye size={20} weight="regular" />
                  )}
                </button>
              </div>
              
              {/* Error Hint */}
              {error && (
                <p 
                  className="mt-2"
                  style={{ 
                    fontFamily: 'var(--font-bitter)', 
                    fontWeight: 400, 
                    fontSize: '14px',
                    color: '#EE683F',
                    margin: 0,
                    marginTop: '8px'
                  }}
                >
                  Incorrect password. Please, try again
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1"
              style={{ 
                width: '180px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              {loading ? 'Checking...' : 'Log in'}
            </button>
          </form>
          </div>

          {/* Right side - Illustration */}
          <div className="flex-1 flex items-center justify-center">
            <img 
              src="/IMG.png" 
              alt="Learning illustration" 
              className="w-full h-auto"
              style={{ maxWidth: '450px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

