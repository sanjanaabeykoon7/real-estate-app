'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { signIn } from 'next-auth/react'

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('');
  const [isUserTypeOpen, setIsUserTypeOpen] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const userTypes = [
    { value: 'USER', label: 'Property Buyer/Renter' },
    { value: 'AGENT', label: 'Real Estate Agent' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: loginData.username, // Using username as email
        password: loginData.password,
        redirect: false
      });

      if (result?.error) {
        alert('Invalid credentials');
      } else {
        onClose();
        // Optionally refresh the page to show updated auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      alert('Please agree to terms and conditions');
      return;
    }
    if (!userType) {
      alert('Please select a user type');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          name: registerData.username,
          role: userType
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after registration
        const result = await signIn('credentials', {
          email: registerData.email,
          password: registerData.password,
          redirect: false
        });

        if (result?.error) {
          alert('Registration successful but login failed. Please login manually.');
        } else {
          onClose();
          window.location.reload();
        }
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {mode === 'login' ? 'Sign into your account' : 'Create an account'}
            </h2>
          </div>

          {/* Forms */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Email"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.username}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Retype Password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Custom Dropdown for User Type */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserTypeOpen(!isUserTypeOpen)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span className={userType ? 'text-gray-800' : 'text-gray-400'}>
                    {userType ? userTypes.find(type => type.value === userType)?.label : 'Select User Type'}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gray-400 transition-transform ${isUserTypeOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isUserTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {userTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setUserType(type.value);
                          setIsUserTypeOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree with{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => console.log('Open terms modal')}
                  >
                    terms & conditions
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-6 flex justify-between items-center text-sm">
            {mode === 'login' ? (
              <>
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Register here!
                </button>
                <button
                  onClick={() => console.log('Forgot password')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Back to login
                </button>
                <button
                  onClick={() => console.log('Forgot password')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;