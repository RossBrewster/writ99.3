import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface CreateClassroomProps {
  onClassroomCreated?: () => void;
}

const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required').max(100, 'Classroom name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type FormValues = z.infer<typeof classroomSchema>;

const CreateClassroom: React.FC<CreateClassroomProps> = ({ onClassroomCreated }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { isAuthenticated, role, id } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setError('');
    setSuccess(false);

    if (!isAuthenticated || role !== 'teacher') {
      setError('You must be logged in as a teacher to create a classroom');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          teacherId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create classroom');
      }

      setSuccess(true);
      form.reset();
      if (onClassroomCreated) {
        onClassroomCreated();
      }
      setTimeout(() => setIsOpen(false), 2000); // Close the modal after 2 seconds
    } catch (err) {
      setError('An error occurred while creating the classroom');
    }
  };

  const dialogContent = (
    <DialogContent className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} transition-colors duration-200`}>
      <DialogHeader>
        <DialogTitle>Create New Classroom</DialogTitle>
      </DialogHeader>
      {!isAuthenticated || role !== 'teacher' ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>You must be logged in as a teacher to create a classroom.</AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDarkMode ? 'text-white' : 'text-gray-800'}>Classroom Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter classroom name"
                      className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDarkMode ? 'text-white' : 'text-gray-800'}>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter classroom description"
                      className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Create Classroom</Button>
          </form>
        </Form>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className={`mt-4 ${isDarkMode ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Classroom created successfully!</AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Classroom</Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};

export default CreateClassroom;