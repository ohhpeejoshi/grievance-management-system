import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SubmitGrievance from "./components/SubmitGrievance";
import Home from "./components/Home";
import TrackGrievance from "./components/TrackGrievance";
import About from "./components/About";
import OfficeBearer from "./components/OfficeBearer";
import Faq from "./components/Faq";
export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/track-grievance" element={<TrackGrievance />} />
                <Route path="/submit-grievance" element={<SubmitGrievance />} />
                <Route path="/About" element={<About />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/office-bearer" element={<OfficeBearer />} />
            </Routes>
        </Router>
    );
}
