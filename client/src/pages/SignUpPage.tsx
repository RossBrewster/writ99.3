import React, { useState } from 'react';
import { DarkModeToggle } from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../contexts/DarkModeContext'; // Updated import
import { Logo } from '../components/shared/BlankLogo';
import { useNavigate } from 'react-router-dom';
import { ButtonData } from '../types/types';

interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export const SignUpPage: React.FC = () => {
  const { isDarkMode } = useDarkMode(); // Updated to use the new context
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const inputClasses = `
    appearance-none rounded-none relative block w-full px-3 py-2 border
    ${isDarkMode 
      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
    }
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const userData: UserResponse = await response.json();
      console.log('Registration successful', userData);
      setSuccessMessage(`Account created successfully for ${userData.username}`);
      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration');
      }
    }
  };


  const logoButtons: ButtonData[] = [
    { text: 'Teachers', color: '#EA4335' },
    { text: 'Students', color: '#34A853' },
    { text: 'Sign Up', color: '#FBBC05' },
    { text: 'About Us', color: '#4285F4' },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} font-sans`}>
      <DarkModeToggle /> {/* Updated: removed props */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <Logo buttons={logoButtons} />
        </div>
        <div className="w-full max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Create your account
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`${inputClasses} rounded-t-md`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClasses}
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
                  autoComplete="new-password"
                  required
                  className={inputClasses}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`${inputClasses} rounded-b-md`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-around">
              <div className="flex items-center">
                <input
                  id="role-student"
                  name="role"
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="role-student" className="ml-2 block text-sm">
                  Student
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="role-teacher"
                  name="role"
                  type="radio"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="role-teacher" className="ml-2 block text-sm">
                  Teacher
                </label>
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
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};