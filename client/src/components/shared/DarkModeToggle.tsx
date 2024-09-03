import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext'; // Update the import path as needed

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-5 right-5 bg-transparent border-none cursor-pointer p-2.5 z-10"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDarkMode ? (
        <Sun size={24} color="#ffffff" />
      ) : (
        <Moon size={24} color="#000000" />
      )}
    </button>
  );
};