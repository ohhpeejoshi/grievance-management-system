import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { FilePlus2, LineChart, FilePenLine, Briefcase, ShieldCheck, Crown, ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex flex-col justify-center items-center px-6 py-12">
            <div className="max-w-6xl w-full text-center">

                {/* --- ORIGINAL HEADING WITH TYPING ANIMATION --- */}
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                    <span className="block sm:hidden">
                        Grievance Management Portal
                    </span>
                    <span className="hidden sm:block">
                        <TypeAnimation
                            sequence={[
                                "Grievance Management Portal",
                                750,
                                "One-Stop Solution",
                                750,
                                "Streamlined Grievance",
                                750,
                            ]}
                            wrapper="span"
                            speed={50}
                            style={{ display: "inline-block" }}
                            repeat={Infinity}
                        />
                    </span>
                </h1>

                <p className="text-lg text-gray-700 mt-4 max-w-3xl mx-auto">
                    A streamlined platform for students and faculty to submit, track, and resolve grievances efficiently.
                </p>

                {/* --- NEW ACTION CARDS --- */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Link to="/submit-grievance" className="group block p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <FilePlus2 className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit a New Grievance</h2>
                        <p className="text-gray-600">Have an issue? Lodge your complaint here with all the necessary details and attachments.</p>
                    </Link>

                    <Link to="/track-grievance" className="group block p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <LineChart className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Track Your Grievance</h2>
                        <p className="text-gray-600">Check the real-time status of your submitted grievances using your unique Ticket ID.</p>
                    </Link>
                </div>

                {/* --- NEW "HOW IT WORKS" SECTION --- */}
                <div className="mt-20 w-full">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">The Grievance Lifecycle</h2>
                    <p className="text-gray-700 mb-12">Follow the journey of your grievance through our structured resolution process.</p>

                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
                        {/* Step 1: Submission */}
                        <div className="p-6 bg-white/30 backdrop-blur-sm rounded-xl shadow-md w-full max-w-xs text-center">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                                <FilePenLine className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">1. You Submit</h3>
                            <p className="mt-2 text-sm text-gray-600">Your grievance is securely logged into our system with a unique Ticket ID.</p>
                        </div>

                        <ArrowRight className="w-12 h-12 text-gray-600/50 hidden lg:block mx-4" />

                        {/* Step 2: Office Bearer */}
                        <div className="p-6 bg-white/30 backdrop-blur-sm rounded-xl shadow-md w-full max-w-xs text-center">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                                <Briefcase className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">2. Office Bearer</h3>
                            <p className="mt-2 text-sm text-gray-600">The relevant department reviews and acts upon your grievance within a set timeframe.</p>
                        </div>

                        <ArrowRight className="w-12 h-12 text-gray-600/50 hidden lg:block mx-4" />

                        {/* Step 3: Approving Authority */}
                        <div className="p-6 bg-white/30 backdrop-blur-sm rounded-xl shadow-md w-full max-w-xs text-center">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">3. Authority</h3>
                            <p className="mt-2 text-sm text-gray-600">If unresolved, the issue is automatically escalated for higher-level review.</p>
                        </div>

                        <ArrowRight className="w-12 h-12 text-gray-600/50 hidden lg:block mx-4" />

                        {/* Step 4: Admin */}
                        <div className="p-6 bg-white/30 backdrop-blur-sm rounded-xl shadow-md w-full max-w-xs text-center">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                                <Crown className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">4. Admin</h3>
                            <p className="mt-2 text-sm text-gray-600">For critical issues, the admin ensures final oversight and guarantees a resolution.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
