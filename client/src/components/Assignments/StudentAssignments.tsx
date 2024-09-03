import React, { useState, useEffect } from 'react';
import { useEnrollments } from '../../contexts/EnrollmentsContext';
import { AlertCircle, Book } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from "../ui/button"
import { useDarkMode } from '../../contexts/DarkModeContext';
import AnimatedLoaderIcon from '../shared/AnimatedLoaderIcon';

interface Assignment {
  id: number;
  title: string;
  description: string;
}

interface ClassroomAssignment {
  id: number;
  assignment: Assignment;
  classroomId: number;
  dueDate: string;
}

export const StudentAssignments: React.FC = () => {
    const { selectedClassroom } = useEnrollments();
    const [assignments, setAssignments] = useState<ClassroomAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isDarkMode } = useDarkMode();
  
    useEffect(() => {
      if (selectedClassroom) {
        fetchAssignments();
      }
    }, [selectedClassroom]);
  
    const fetchAssignments = async () => {
      if (!selectedClassroom) return;
      setLoading(true);
      setShowLoader(true);
      setError(null);
      try {
        const response = await fetch(`/api/assignments/classroom/${selectedClassroom.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError('Failed to fetch assignments');
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setShowLoader(false), 800);
      }
    };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!selectedClassroom) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Book size={48} />
        <p className="mt-4 text-lg">Please select a classroom to view assignments</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl rounded-2xl p-4 mt-8 flex flex-col justify-start shadow-2xl ${isDarkMode ? "bg-[#395286]" : "bg-[#f3f4f8]"}`}>
      {showLoader && (
        <div className="flex justify-center items-center h-64">
          <AnimatedLoaderIcon />
        </div>
      )}
      {!loading && !showLoader && (
        <>
          <h2 className="text-2xl font-[Saira] w-full text-left border-b-[#c2cada] border-b-2 pl-4 mb-4 pb-2">
            Assignments ({assignments.length}) - {selectedClassroom.name} 
          </h2>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {assignments.map((classroomAssignment) => (
                <div
                  key={classroomAssignment.id}
                  className={`p-4 rounded flex flex-col gap-2 shadow-lg ${
                    isDarkMode ? "bg-[#4b6aaf] hover:bg-[#7291d3] hover:text-black" : "bg-[#fafcfe] hover:bg-[#eff3ff]"
                  }`}
                >
                  <h3 className="font-semibold truncate">{classroomAssignment.assignment.title}</h3>
                  <p className="text-sm truncate">{classroomAssignment.assignment.description}</p>
                  <p className="text-sm"><strong>Due:</strong> {formatDate(classroomAssignment.dueDate)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="w-full flex justify-end gap-4 mt-4">
            <Button onClick={fetchAssignments} className="bg-blue-500 hover:bg-blue-600 text-white text-md">Refresh Assignments</Button>
          </div>
        </>
      )}
    </div>
  );
};