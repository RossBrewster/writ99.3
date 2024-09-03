import React from 'react';
import { DashboardHeader } from '../components/shared/DashboardHeader';
// import { JoinClassroom } from '../components/classroom/JoinClassroom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { ClassroomSelector } from '../components/classroom/ClassroomSelector';
import { StudentAssignments } from "../components/Assignments/StudentAssignments"
import HighlightText from '../components/HightlightText';

export const StudentDashboard: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-[#1c2740]' : 'bg-gray-100'}`}>
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="flex flex-col justify-start items-center">
          <ClassroomSelector />
          <StudentAssignments />
          <HighlightText />
        </div>
      </div>
    </div>
    );
};