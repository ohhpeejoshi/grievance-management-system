const contacts = [
    { id: 1, name: "Ansh Gupta", role: "Developer", email: "22ucc017@lnmiit.ac.in", phone: "+91 79067 26971" },
    { id: 2, name: "Arpit Joshi", role: "Developer", email: "22ucc023@lnmiit.ac.in", phone: "+91 63755 91132" },
    { id: 3, name: "Parth Ramdeo", role: "Developer", email: "22ucc072@lnmiit.ac.in", phone: "+91 73572 22550" },

];

export default function Contact() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-20 px-4">
            <div className="container mx-auto p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Contact Us</h1>
                <p className="text-lg text-gray-700 mt-4 text-center">
                    Reach out to the concerned authorities for grievance resolution.
                </p>

                <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="p-6 bg-white rounded-xl shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800">{contact.name}</h2>
                            <p className="text-gray-600">{contact.role}</p>
                            <p className="text-gray-600">📧 <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a></p>
                            <p className="text-gray-600">📞 {contact.phone}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
