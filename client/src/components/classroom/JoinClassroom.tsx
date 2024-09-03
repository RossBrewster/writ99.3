import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

// Define the Zod schema for form validation
const joinClassroomSchema = z.object({
  invitationCode: z.string().min(1, { message: "Invitation code is required" })
});

type JoinClassroomFormValues = z.infer<typeof joinClassroomSchema>;

export const JoinClassroom: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<JoinClassroomFormValues>({
    resolver: zodResolver(joinClassroomSchema),
    defaultValues: {
      invitationCode: '',
    },
  });

  const onSubmit = async (values: JoinClassroomFormValues) => {
    if (!isAuthenticated) {
      setError('You must be logged in to join a classroom.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`api/classrooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationCode: values.invitationCode }),
      });

      const responseData = await response.json();

      if (response.status === 401) {
        logout();
        navigate('/login', { state: { from: '/join-classroom' } });
        return;
      }

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Successfully joined the classroom!');
      setTimeout(() => {
        setIsOpen(false);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error details:', err);
      if (err instanceof Error) {
        switch (err.message) {
          case 'User not found':
          case 'Invalid invitation code':
          case 'Invitation code has expired':
          case 'You are already enrolled in this classroom':
            setError(err.message);
            break;
          default:
            setError('An error occurred while joining the classroom. Please try again later.');
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="max-w-52 m-4 text-lg text-white bg-[#4284F3] hover:bg-[#2e5daf] hover:text-white" >Join a Classroom</Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[425px] ${isDarkMode ? 'bg-[#3469c5]' : ''}`}>
        <DialogHeader>
          <DialogTitle>Join a Classroom</DialogTitle>
          <DialogDescription className={`${isDarkMode ? 'text-[#d1d1d1]' : 'text-grey-800'}`}>
            Enter the invitation code to join a classroom.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invitationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invitation Code</FormLabel>
                  <FormControl>
                    <Input placeholder="000-000" {...field} className={`${isDarkMode ? 'bg-[#2e5daf] text-white' : ''}`}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className={isDarkMode ? 'bg-[#28447f] hover:bg-[#233d76] text-white w-full' : 'w-full bg-[#4284F3] hover:bg-[#3971d3]'}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Classroom'
              )}
            </Button>
          </form>
        </Form>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};