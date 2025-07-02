import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Loader from "./components/Loader";
import Navbar from "./components/Navbar"; // Student/Faculty/Staff Navbar
import Home from "./components/Home";
import TrackGrievance from "./components/TrackGrievance";
import SubmitGrievance from "./components/SubmitGrievance";
import About from "./components/About";
import Faq from "./components/Faq";
import OfficeBearer from "./components/OfficeBearer";
import Register from "./components/Register";
import Login from "./components/Login";
import Authority from "./components/Authority";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  // Sample role - This should come from actual user authentication/role management system
  const userRole = "student"; // This is just a placeholder, change it dynamically as per actual logic

  // Render Navbar only for student, faculty, or staff
  const shouldRenderNavbar = userRole === "student" || userRole === "faculty" || userRole === "staff";

  return (
    <>
      {!hideNavbar && shouldRenderNavbar && <Navbar />} {/* Render Navbar conditionally */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/track-grievance" element={<TrackGrievance />} />
        <Route path="/submit-grievance" element={<SubmitGrievance />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/office-bearer" element={<OfficeBearer />} />
        <Route path="/authority" element={<Authority />} />
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
