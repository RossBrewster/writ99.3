import React from 'react';
import { DashboardHeader } from '../components/shared/DashboardHeader';
import { useMenu } from '../contexts/MenuContext';
import { Sidebar } from '../components/shared/SideBar';
import { useDarkMode } from '../contexts/DarkModeContext';
import { ClassroomSelector } from '../components/classroom/ClassroomSelector';
import { Roster } from "../components/classroom/Roster"
import { ClassroomAssignments } from '../components/Assignments/ClassroomAssignments';


export const TeacherDashboard: React.FC = () => {
  const { isMenuOpen } = useMenu();
  const { isDarkMode } = useDarkMode(); // Use the useDarkMode hook

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#18243b]' : 'bg-gray-100'}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className={`flex-1 flex flex-col justify-start overflow-x-hidden overflow-y-auto p-6 items-center ${isDarkMode ? 'bg-[#1f3152]' : 'bg-gray-200'}`}>
          {isMenuOpen && (
            <Sidebar userType="teacher"/>
          )}
          <ClassroomSelector />
          <Roster />
          <ClassroomAssignments />
        </main>
      </div>
    </div>
  );
};