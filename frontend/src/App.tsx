import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ResultsPage } from './pages/ResultsPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { JobsPage } from './pages/JobsPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            <AuthProvider>
              <Router>
                <Routes>
                  <Route element={<AppLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Workspace Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analyze"
                      element={
                        <ProtectedRoute>
                          <AnalyzePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/jobs"
                      element={
                        <ProtectedRoute>
                          <JobsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/results/:id"
                      element={
                        <ProtectedRoute>
                          <ResultsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/interview"
                      element={
                        <ProtectedRoute>
                          <MockInterviewPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/roadmap"
                      element={
                        <ProtectedRoute>
                          <RoadmapPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Router>
            </AuthProvider>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
