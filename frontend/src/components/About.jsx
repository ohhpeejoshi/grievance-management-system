const Abouts = [
    { id: 1, name: "Ansh Gupta", role: "Developer", email: "22ucc017@lnmiit.ac.in", phone: "+91 79067 26971" },
    { id: 2, name: "Arpit Joshi", role: "Developer", email: "22ucc023@lnmiit.ac.in", phone: "+91 63755 91132" },
    { id: 3, name: "Parth Ramdeo", role: "Developer", email: "22ucc072@lnmiit.ac.in", phone: "+91 73572 22550" },
    { id: 4, name: "Dr. Gaurav Chatterjee", role: "Mentor", email: "gaurav.chatterjee@lnmiit.ac.in", phone: "+91 84338 45849" },
    { id: 5, name: "Soumik Bhaduri", role: "Mentor", email: "soumik.bhaduri@lnmiit.ac.in", phone: "+91 97480 22245" },
    { id: 6, name: "Bhawani Shankar Sharma", role: "Mentor", email: "bhawani.sharma@lnmiit.ac.in", phone: "+91 81040 66299" },
];

export default function About() {
    const developers = Abouts.filter(c => c.role === "Developer");
    const mentors = Abouts.filter(c => c.role === "Mentor");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-300 to-blue-300 px-4">
            <div className="w-full max-w-5xl p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 text-center">About Us</h1>
                <p className="text-lg text-gray-700 mt-4 text-center">
                    Reach out to the concerned authorities for grievance resolution.
                </p>

                {/* Mentors Section (Top) */}
                <h2 className="text-2xl font-semibold text-gray-800 mt-10 text-center">Mentors</h2>
                <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => (
                        <div key={mentor.id} className="p-6 bg-white rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800">{mentor.name}</h3>
                            <p className="text-gray-600">{mentor.role}</p>
                            <p className="text-gray-600">📧 <a href={`mailto:${mentor.email}`} className="text-blue-600 hover:underline">{mentor.email}</a></p>
                            <p className="text-gray-600">📞 {mentor.phone}</p>
                        </div>
                    ))}
                </div>

                {/* Developers Section */}
                <h2 className="text-2xl font-semibold text-gray-800 mt-10 text-center">Developers</h2>
                <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {developers.map((dev) => (
                        <div key={dev.id} className="p-6 bg-white rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800">{dev.name}</h3>
                            <p className="text-gray-600">{dev.role}</p>
                            <p className="text-gray-600">📧 <a href={`mailto:${dev.email}`} className="text-blue-600 hover:underline">{dev.email}</a></p>
                            <p className="text-gray-600">📞 {dev.phone}</p>
                        </div>
                    ))}
                </div>

               
            </div>
        </div>
    );
}
