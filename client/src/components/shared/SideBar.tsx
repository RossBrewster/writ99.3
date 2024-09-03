import React from 'react';
import { Home, Book, Users, Settings, BoxesIcon } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext'; // Updated import

interface SidebarProps {
  userType: 'teacher' | 'student';
}

export const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const { isDarkMode } = useDarkMode(); // Using the new context

  const menuItems = userType === 'teacher'
    ? [
        { icon: Home, text: 'Dashboard', link: '/dashboard' },
        { icon: Book, text: 'Assignments', link: '/assignments' },
        { icon: Users, text: 'Students', link: '/students' },
        { icon: Settings, text: 'Settings', link: '/settings' },
        { icon: BoxesIcon, text: 'Rubrics', link: '/rubrics' },
      ]
    : [
        { icon: Home, text: 'Dashboard', link: '/dashboard' },
        { icon: Book, text: 'My Assignments', link: '/my-assignments' },
        { icon: Settings, text: 'Settings', link: '/settings' },
      ];

  return (
    <aside className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} w-64 min-h-full p-4 transition-colors duration-200 rounded-md`}>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-2">
              <div 
                className={`flex items-center p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded transition-colors duration-200`}
              >
                <item.icon size={20} className="mr-2" />
                {item.text}
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};