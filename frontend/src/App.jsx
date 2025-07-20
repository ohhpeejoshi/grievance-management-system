import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import TrackGrievance from "./components/TrackGrievance";
import SubmitGrievance from "./components/SubmitGrievance";
import About from "./components/About";
import Faq from "./components/Faq";
import OfficeBearer from "./components/OfficeBearer";
import ApprovingAuthority from "./components/ApprovingAuthority";
import Admin from "./components/Admin";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import GrievanceHistory from "./components/GrievanceHistory"; // Import the new component

function AppContent() {
  const location = useLocation();
  const hideNavbar = [
    "/login",
    "/register",
    "/forgot-password",
    "/office-bearer",
    "/approving-authority",
    "/admin"
  ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-grievance"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <TrackGrievance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-grievance"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <SubmitGrievance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faq"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Faq />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grievance-history"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <GrievanceHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office-bearer"
          element={
            <ProtectedRoute allowedRoles={['office-bearer']}>
              <OfficeBearer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approving-authority"
          element={
            <ProtectedRoute allowedRoles={['approving-authority']}>
              <ApprovingAuthority />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <AppContent />
    </Router>
  );
}