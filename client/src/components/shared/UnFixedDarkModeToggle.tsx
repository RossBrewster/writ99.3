import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext'; // Update the import path as needed
export const UnFixedDarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      className="bg-transparent border-none cursor-pointer p-2.5 z-10"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDarkMode ? (
        <Sun size={24} color="#ffffff" />
      ) : (
        <Moon size={24} color="#ffffff" />
      )}
    </button>
  );
};