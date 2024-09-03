import React, { useState } from 'react';
import { useClassrooms } from '../../contexts/ClassroomContext';
import { Alert, AlertDescription } from '../ui/alert';

export const GenerateInvitation: React.FC = () => {
  const { selectedClassroom } = useClassrooms();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInvitation = async () => {
    if (!selectedClassroom) {
      setError('No classroom selected');
      return;
    }

    try {
      const response = await fetch(`/api/classrooms/${selectedClassroom.id}/generate-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      if (response.ok) {
        const { code } = await response.json();
        setInvitationCode(code);
        setError(null);
      } else {
        setError('Failed to generate invitation code');
      }
    } catch (error) {
      setError('Error generating invitation code');
      console.error('Error generating invitation code:', error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto flex gap-2 overflow-hidden md:max-w-2xl">
            <button 
        onClick={generateInvitation}
        disabled={!selectedClassroom}
        className="px-4 py-2 text-md text-white bg-[#4284F3] rounded shadow-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Generate Invitation Code
      </button>
      {invitationCode && (
        <div className=" p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          Invitation Code: <span className="font-bold">{invitationCode}</span>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};