const contacts = [
    { id: 1, name: "Dr. Usha Kanoongo", role: "Head of Grievance Cell", email: "usha.kanoongo@lnmiit.ac.in", phone: "+91 98765 43210" },
    { id: 2, name: "Aditya Kansal", role: "Student Coordinator", email: "aditya.kansal@lnmiit.ac.in", phone: "+91 98765 43211" },
    { id: 3, name: "Neha Raniwala", role: "Student Coordinator", email: "neha.raniwala@lnmiit.ac.in", phone: "+91 98765 43212" },
    { id: 4, name: "Kunal Sharma", role: "Support Staff", email: "kunal.sharma@lnmiit.ac.in", phone: "+91 98765 43213" },
];

export default function Contact() {
    return (
        <div className="container mt-20 p-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Contact Us</h1>
            <p className="text-lg text-gray-600 mt-4 text-center">
                Reach out to the concerned authorities for grievance resolution.
            </p>

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact) => (
                    <div key={contact.id} className="p-6 bg-white shadow-md rounded-md">
                        <h2 className="text-xl font-semibold text-gray-800">{contact.name}</h2>
                        <p className="text-gray-600">{contact.role}</p>
                        <p className="text-gray-600">📧 <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a></p>
                        <p className="text-gray-600">📞 {contact.phone}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
