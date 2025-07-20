import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, icon, children }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-red-blue bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
            style={{ zIndex: 1000 }}
        >
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 animate-enter">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        {icon}
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition">
                        <X size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;