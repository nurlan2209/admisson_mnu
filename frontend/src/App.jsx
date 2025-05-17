// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Header from './components/Header/Header';

// Pages
import Login from './pages/Login/Login';
import PublicQueueForm from './pages/PublicQueueForm/PublicQueueForm';
import AdmissionDashboard from './pages/AdmissionDashboard/AdmissionDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

// Styles
import './App.css';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admission') {
      return <Navigate to="/admission" />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    }
  }
  
  return children;
};

function App() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="app">
      <Header />
      <main className="content">
        <Routes>
          {/* Public routes */}
          <Route path="/queue" element={<PublicQueueForm />} />
          
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to={
                user.role === 'admission' ? '/admission' : '/admin'
              } /> : 
              <Login />
          } />
          
          {/* Protected routes */}
          <Route path="/admission" element={
            <ProtectedRoute allowedRoles={['admission']}>
              <AdmissionDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to={
                user.role === 'admission' ? '/admission' : '/admin'
              } /> : 
              <Navigate to="/queue" />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;