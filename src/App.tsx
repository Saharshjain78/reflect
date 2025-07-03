import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const JournalEntryForm = React.lazy(() => import('./pages/JournalEntryForm'));
const JournalEntryDetail = React.lazy(() => import('./pages/JournalEntryDetail'));
const JournalList = React.lazy(() => import('./pages/JournalList'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ReflectionForm = React.lazy(() => import('./pages/ReflectionForm'));
const ScrapbookPage = React.lazy(() => import('./pages/ScrapbookPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JournalProvider>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
                  <Route path="/new-entry" element={<ProtectedRoute><JournalEntryForm /></ProtectedRoute>} />
                  <Route path="/entries/:id" element={<ProtectedRoute><JournalEntryDetail /></ProtectedRoute>} />
                  <Route path="/entries/:id/edit" element={<ProtectedRoute><JournalEntryForm /></ProtectedRoute>} />
                  <Route path="/scrapbook" element={<ProtectedRoute><ScrapbookPage /></ProtectedRoute>} />
                  <Route path="/scrapbook/:id" element={<ProtectedRoute><ScrapbookPage /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/reflection" element={<ProtectedRoute><ReflectionForm /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </JournalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;