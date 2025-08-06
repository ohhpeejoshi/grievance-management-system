import { useState } from "react";

const faqs = [
    {
        question: "How can I file a grievance?",
        answer: "You can file a grievance through the 'Submit Grievance' section after logging in with your institutional email ID."
    },
    {
        question: "Can I file a grievance anonymously?",
        answer: "No, anonymous grievances are not accepted. Login with your LNMIIT ID is required to ensure authenticity and response."
    },
    {
        question: "What types of grievances can I report?",
        answer: "You can report issues related to academics, infrastructure, behavior, discrimination, or any violation of institute policies."
    },
    {
        question: "How long does it take to resolve a grievance?",
        answer: "Most grievances are addressed within 7 working days. If more time is needed, you will be informed of the progress."
    },
    {
        question: "Can faculty members also use this portal?",
        answer: "Yes, the portal is open to both students and faculty for submitting and tracking grievances."
    },

];

export default function FAQs() {
    const [activeIndexes, setActiveIndexes] = useState([]);

    const toggleIndex = (index) => {
        if (activeIndexes.includes(index)) {
            setActiveIndexes(activeIndexes.filter((i) => i !== index));
        } else {
            setActiveIndexes([...activeIndexes, index]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-20 px-4 flex items-center justify-center">
            <div className="container max-w-4xl mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg">
                <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">Frequently Asked Questions</h1>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all">
                            <button
                                onClick={() => toggleIndex(index)}
                                className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
                            >
                                <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                                <span className="text-xl text-gray-500">{activeIndexes.includes(index) ? "−" : "+"}</span>
                            </button>
                            {activeIndexes.includes(index) && (
                                <div className="px-6 pb-4 text-gray-700">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}