import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Classroom {
  id: number;
  name: string;
  // Add other relevant classroom properties
}
interface ClassroomContextType {
  classrooms: Classroom[];
  loading: boolean;
  error: string | null;
  refreshClassrooms: () => void;
  selectedClassroom: Classroom | null;
  selectClassroom: (classroom: Classroom | null) => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);
export const ClassroomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const { isAuthenticated, isLoading: authLoading, id: userId, role } = useAuth();

  const fetchClassrooms = async () => {
    if (!isAuthenticated || !userId || role !== 'teacher') {
      setError('User is not authenticated or not a teacher');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/classrooms/teacher/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setClassrooms(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch classrooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!authLoading && isAuthenticated && userId && role === 'teacher') {
      fetchClassrooms();
    }
  }, [authLoading, isAuthenticated, userId, role]);
  const refreshClassrooms = () => {
    fetchClassrooms();
  };

  const selectClassroom = (classroom: Classroom | null) => {
    setSelectedClassroom(classroom);
  };

  return (
    <ClassroomContext.Provider 
      value={{ 
        classrooms, 
        loading, 
        error, 
        refreshClassrooms, 
        selectedClassroom, 
        selectClassroom 
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};
export const useClassrooms = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassrooms must be used within a ClassroomProvider');
  }
  return context;
};
// Helper function for authenticated API calls
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token available');
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('API request failed');
  }
  return response.json();
};