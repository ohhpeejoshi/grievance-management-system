import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from '../assets/Logo_LNMIIT2.png'; // adjust path if needed

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-50 shadow-xl p-4 rounded-b-2xl backdrop-blur-md sticky top-0 z-50 border-b border-white/30 ">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                </Link>


                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-8 text-gray-800 font-semibold tracking-wide">
                    <Link to="/" className="relative group">
                        <span className="hover:text-gray-600 transition-colors duration-200">Home</span>
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/submit-grievance" className="relative group">
                        <span className="hover:text-gray-600 transition-colors duration-200">Submit Grievance</span>
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/track-grievance" className="relative group">
                        <span className="hover:text-gray-600 transition-colors duration-200">Track Grievance</span>
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/contact" className="relative group">
                        <span className="hover:text-gray-600 transition-colors duration-200">Contact</span>
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/faq" className="relative group">
                        <span className="hover:text-gray-600 transition-colors duration-200">FAQs</span>
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-800 hover:text-gray-600 transition-colors"
                    >
                        {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden mt-3 rounded-lg bg-white/20 backdrop-blur-md shadow-lg px-6 py-4 text-gray-800 space-y-4 font-semibold tracking-wide">
                    <Link to="/" className="block hover:text-gray-600 transition-colors duration-200">Home</Link>
                    <Link to="/submit-grievance" className="block hover:text-gray-600 transition-colors duration-200">Submit Grievance</Link>
                    <Link to="/track-grievance" className="block hover:text-gray-600 transition-colors duration-200">Track Grievance</Link>
                    <Link to="/contact" className="block hover:text-gray-600 transition-colors duration-200">Contact</Link>
                </div>
            )}
        </nav>
    );
}
