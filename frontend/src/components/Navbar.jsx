import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import logo from "../assets/Logo_LNMIIT2.png";
import toast from 'react-hot-toast';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = localStorage.getItem("userEmail") || "user@example.com";

    const handleLogout = () => {
        toast((t) => (
            <span className="flex flex-col items-center gap-2">
                Are you sure you want to logout?
                <div className="flex gap-4">
                    <button onClick={() => { toast.dismiss(t.id); localStorage.clear(); navigate("/login"); }}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                        Yes
                    </button>
                    <button onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 text-black px-3 py-1 rounded-md text-sm">
                        No
                    </button>
                </div>
            </span>
        ), { duration: 6000 });
    };

    // Function to determine if a link is active
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: "/home", label: "Home" },
        { path: "/submit-grievance", label: "Submit Grievance" },
        { path: "/track-grievance", label: "Track Grievance" },
        { path: "/grievance-history", label: "History" },
        { path: "/about", label: "About" },
        { path: "/faq", label: "FAQs" },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center px-4 py-3">
                <Link to="/home">
                    <img src={logo} alt="LNMIIT Logo" className="h-12 w-auto" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path}
                            className={`relative py-2 ${isActive(link.path) ? 'text-blue-600' : 'hover:text-blue-600'} transition-colors duration-300`}>
                            {link.label}
                            {isActive(link.path) && <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600"></span>}
                        </Link>
                    ))}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative hidden md:block">
                    <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <User size={20} />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-20">
                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                Signed in as <br /><strong className="text-gray-800">{userEmail}</strong>
                            </div>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white">
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden px-4 pt-2 pb-4 space-y-2">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                            className={`block px-4 py-2 rounded-md text-base font-medium ${isActive(link.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Signed in as <br /><strong className="text-gray-800">{userEmail}</strong>
                        </div>
                        <button onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}