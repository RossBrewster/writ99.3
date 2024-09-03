import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Classroom {
  id: number;
  name: string;
  description: string;
  teacherId: number;
}

interface EnrollmentsContextType {
  enrolledClassrooms: Classroom[];
  selectedClassroom: Classroom | null;
  isLoading: boolean;
  error: string | null;
  fetchEnrollments: () => Promise<void>;
  selectClassroom: (classroomId: number) => void;
  joinClassroom: (invitationCode: string) => Promise<void>;
}

const EnrollmentsContext = createContext<EnrollmentsContextType | undefined>(undefined);

export const EnrollmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchEnrollments = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/classrooms/enrolled', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const classrooms: Classroom[] = await response.json();
      setEnrolledClassrooms(classrooms);
      if (classrooms.length > 0 && !selectedClassroom) {
        setSelectedClassroom(classrooms[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [isAuthenticated]);

  const selectClassroom = (classroomId: number) => {
    const classroom = enrolledClassrooms.find(c => c.id === classroomId);
    if (classroom) {
      setSelectedClassroom(classroom);
    }
  };

  const joinClassroom = async (invitationCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ invitationCode }),
      });
      if (!response.ok) throw new Error('Failed to join classroom');
      await fetchEnrollments(); // Refresh the list of enrollments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EnrollmentsContext.Provider
      value={{
        enrolledClassrooms,
        selectedClassroom,
        isLoading,
        error,
        fetchEnrollments,
        selectClassroom,
        joinClassroom,
      }}
    >
      {children}
    </EnrollmentsContext.Provider>
  );
};

export const useEnrollments = () => {
  const context = useContext(EnrollmentsContext);
  if (context === undefined) {
    throw new Error('useEnrollments must be used within an EnrollmentsProvider');
  }
  return context;
};