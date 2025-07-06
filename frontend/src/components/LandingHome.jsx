import { useNavigate } from "react-router-dom";
import background from "../assets/background.jpg";
import logo from "../assets/Logo_LNMIIT2.png";

export default function LandingHome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
      <img
        src={background}
        alt="LNMIIT Campus"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col items-center">
        <img src={logo} alt="LNMIIT Logo" className="mx-auto h-12 w-auto mb-6" />
        <div className="flex flex-col gap-3 w-full">
          <button
            className="w-full max-w-xs mx-auto bg-blue-600 text-white py-1.5 rounded-xl hover:bg-blue-700 font-medium text-sm"
            onClick={() => navigate("/login")}
          >
            Login as User
          </button>
          <button
            className="w-full max-w-xs mx-auto bg-blue-600 text-white py-1.5 rounded-xl hover:bg-blue-700 font-medium text-sm"
            onClick={() => navigate('/office-bearer-login')}
          >
            Login as Office Bearer
          </button>
          <button
            className="w-full max-w-xs mx-auto bg-blue-600 text-white py-1.5 rounded-xl hover:bg-blue-700 font-medium text-sm"
            onClick={() => navigate('/approving-authority-login')}
          >
            Login as Approving Authority
          </button>
          <button
            className="w-full max-w-xs mx-auto bg-blue-600 text-white py-1.5 rounded-xl hover:bg-blue-700 font-medium text-sm"
            onClick={() => navigate('/admin-login')}
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
