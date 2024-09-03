import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md rounded-lg overflow-hidden transition-colors duration-200`}>
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} px-4 py-2 border-b border-gray-600`}>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};