import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import TrackGrievance from "./components/TrackGrievance";
import SubmitGrievance from "./components/SubmitGrievance";
import About from "./components/About";
import Faq from "./components/Faq";
import OfficeBearer from "./components/OfficeBearer";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";

function AppContent() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register", "/forgot-password"].includes(
    location.pathname
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/track-grievance" element={<TrackGrievance />} />
        <Route path="/submit-grievance" element={<SubmitGrievance />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/office-bearer" element={<OfficeBearer />} />
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
