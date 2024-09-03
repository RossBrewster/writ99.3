import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { SignUpPage } from './pages/SignUpPage';
import { HomePage } from './pages/HomePage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import { EnrollmentsProvider } from './contexts/EnrollmentsContext'; // Import the EnrollmentsProvider
import { Animator } from "./components/Animator"
import { ChatInterface } from './components/ChatInterface';
import { Notes } from './components/Notes';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardRoute: React.FC = () => {
  const { role } = useAuth();

  return (
    <MenuProvider>
      {role === 'teacher' ? (
        <ClassroomProvider>
          <TeacherDashboard />
        </ClassroomProvider>
      ) : (
        <EnrollmentsProvider>
          <StudentDashboard />
        </EnrollmentsProvider>
      )}
    </MenuProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardRoute /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/animate" element={<Animator />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;