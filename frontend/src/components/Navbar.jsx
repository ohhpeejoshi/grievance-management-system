import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md p-4 mb-12">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}

                <Link to="/"><div className="text-2xl font-semibold text-gray-800">
                    LNMIIT Grievance Portal
                </div>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-6 text-gray-700">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <Link to="/submit-grievance" className="hover:text-blue-600">Submit Grievance</Link>
                    <Link to="/track-grievance" className="hover:text-blue-600">Track Grievance</Link>
                    <Link to="/contact" className="hover:text-blue-600">Contact</Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden mt-2 space-y-2 bg-white shadow-md p-4 text-gray-700">
                    <Link to="/" className="block hover:text-blue-600">Home</Link>
                    <Link to="/submit-grievance" className="block hover:text-blue-600">Submit Grievance</Link>
                    <Link to="/track-grievance" className="block hover:text-blue-600">Track Grievance</Link>
                    <Link to="/contact" className="block hover:text-blue-600">Contact</Link>
                </div>
            )}
        </nav>
    );
}