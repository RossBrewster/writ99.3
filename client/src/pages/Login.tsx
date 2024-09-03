import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DarkModeToggle } from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Logo } from '../components/shared/BlankLogo';
import { useAuth } from '../contexts/AuthContext';
import { ButtonData } from '../types/types';

export const LoginPage: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful', data);
        login(data.username, data.role, data.token, data.id);
        setSuccessMessage('Login successful');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    }
  };

  const inputClasses = `
    appearance-none rounded-none relative block w-full px-3 py-2 border
    ${isDarkMode 
      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
    }
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
  `;

  const logoButtons: ButtonData[] = [
    { text: 'Teachers', color: '#EA4335' },
    { text: 'Students', color: '#34A853' },
    { text: 'Sign Up', color: '#FBBC05' },
    { text: 'About Us', color: '#4285F4' },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} font-sans`}>
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <Logo buttons={logoButtons}/>
        </div>
        <div className="w-full">
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold">
            Sign in to your account
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`${inputClasses} rounded-t-md`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`${inputClasses} rounded-b-md`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {successMessage && (
              <div className="text-green-500 text-sm text-center">{successMessage}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};