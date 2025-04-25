// src/routes/index.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/auth';
import ProtectedRoute from './ProtectedRoute';
import Loading from "../components/Loading/Loading"

// Lazy load Layout
const Layout = lazy(() => import('../components/Layout/Layout'));

// Lazy load pages
const LoginPage = lazy(() => import('../pages/LoginPage/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'));
const LeadsPage = lazy(() => import('../pages/LeadsPage/LeadsPage'));
const LeadDetailsPage = lazy(() => import('../pages/LeadPage/LeadPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('../pages/UnitPage/UnitPage'));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage/EmployeesPage'));
const UpcomingPage = lazy(() => import('../pages/UpcomingPage/UpcomingPage'));

// Simple loading component
const LoadingFallback = () => <Loading isVisible={true} />;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Leads routes */}
              <Route path="/leads">
                <Route 
                  index
                  element={
                    <ProtectedRoute>
                      <LeadsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path=":leadId" 
                  element={
                    <ProtectedRoute>
                      <LeadDetailsPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              {/* Projects routes */}
              <Route path="/projects">
                <Route 
                  index
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path=":projectId" 
                  element={
                    <ProtectedRoute>
                      <ProjectDetailsPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              <Route 
                path="/employees" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <EmployeesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/upcoming" 
                element={
                  <ProtectedRoute>
                    <UpcomingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;