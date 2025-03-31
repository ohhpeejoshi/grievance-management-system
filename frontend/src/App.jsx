import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SubmitGrievance from "./components/SubmitGrievance";
import Home from "./components/Home";
import TrackGrievance from "./components/TrackGrievance";
import Contact from "./components/Contact";

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/track-grievance" element={<TrackGrievance />} />
                <Route path="/submit-grievance" element={<SubmitGrievance />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </Router>
    );
}
