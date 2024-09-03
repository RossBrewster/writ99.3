import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox"; // Import Checkbox component
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useClassrooms } from '../../contexts/ClassroomContext';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  readingMaterial: z.string().optional(),
  prompt: z.string().min(1, 'Prompt is required'),
  minimumDrafts: z.number().min(0, 'Minimum drafts must be 0 or greater'),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  classroomIds: z.array(z.string()).min(1, 'Select at least one classroom'),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateAssignmentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { id: userId } = useAuth();
  const { classrooms } = useClassrooms();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      readingMaterial: '',
      prompt: '',
      minimumDrafts: 1,
      dueDate: new Date(),
      classroomIds: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...values,
          createdById: userId,
          classroomIds: values.classroomIds.map(Number),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      const data = await response.json();
      console.log('Assignment created:', data);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      // Here you might want to set an error state and display it to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn(
          "w-full md:w-auto text-md",
          isDarkMode ? 'bg-[#33A852] hover:bg-[#2E9749] text-white' : 'bg-[#33A852] hover:bg-[#2E9749] text-white'
        )}>
          Create New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(
        "max-w-4xl max-h-[90vh] overflow-y-auto",
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      )}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>Create New Assignment</DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Fill out the form below to create a new assignment for your students.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Assignment title" {...field} className={cn(
                      "w-full",
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    )} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Assignment description" {...field} className={cn(
                      "w-full min-h-[100px]",
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Assignment instructions" {...field} className={cn(
                      "w-full min-h-[100px]",
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="readingMaterial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Material (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Passage or Reading Material" {...field} className={cn(
                        "w-full min-h-[100px]",
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                      )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Assignment prompt" {...field} className={cn(
                      "w-full min-h-[100px]",
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumDrafts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Drafts</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                      className={cn(
                        "w-full",
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                      )} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full md:w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className={cn("w-auto p-0", isDarkMode ? 'bg-gray-700' : 'bg-white')} align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classroomIds"
              render={() => (
                <FormItem>
                  <FormLabel>Classrooms</FormLabel>
                  <div className="space-y-2">
                    {classrooms.map((classroom) => (
                      <div key={classroom.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`classroom-${classroom.id}`}
                          onCheckedChange={(checked) => {
                            const currentIds = form.getValues("classroomIds");
                            if (checked) {
                              form.setValue("classroomIds", [...currentIds, classroom.id.toString()]);
                            } else {
                              form.setValue("classroomIds", currentIds.filter(id => id !== classroom.id.toString()));
                            }
                          }}
                        />
                        <label
                          htmlFor={`classroom-${classroom.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {classroom.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className={cn(
                "w-full md:w-auto",
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              )}
            >
              Create Assignment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};