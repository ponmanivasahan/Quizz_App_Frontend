import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminAttempts from './pages/admin/AdminAttempts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

import StudentLayout from './components/layout/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentQuizzes from './pages/student/StudentQuizzes';
import StudentQuizDetails from './pages/student/StudentQuizDetails';
import StudentAttempts from './pages/student/StudentAttempts';
import StudentPerformance from './pages/student/StudentPerformance';
import StudentLeaderboard from './pages/student/StudentLeaderboard';
import StudentProfile from './pages/student/StudentProfile';

import StudentExam from './pages/student/StudentExam';
import StudentResult from './pages/student/StudentResult';
import StudentReview from './pages/student/StudentReview';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/quizzes" element={<AdminQuizzes />} />
                <Route path="/admin/quizzes/:id/questions" element={<AdminQuestions />} />
                <Route path="/admin/attempts" element={<AdminAttempts />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
              </Route>
            </Route>

            {/* Student Routes */}
            <Route element={<StudentRoute />}>
              {/* Student routes with Sidebar Layout */}
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/quizzes" element={<StudentQuizzes />} />
                <Route path="/student/quizzes/:quizId" element={<StudentQuizDetails />} />
                <Route path="/student/attempts" element={<StudentAttempts />} />
                <Route path="/student/performance" element={<StudentPerformance />} />
                <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>
              
              {/* Student Exam routes WITHOUT Sidebar Layout (Full Screen) */}
              <Route path="/student/quiz/:attemptId" element={<StudentExam />} />
              <Route path="/student/result/:attemptId" element={<StudentResult />} />
              <Route path="/student/review/:attemptId" element={<StudentReview />} />
            </Route>
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
