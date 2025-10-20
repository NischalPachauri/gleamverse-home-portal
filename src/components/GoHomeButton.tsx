import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GoHomeButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-primary text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      aria-label="Go to Home"
    >
      <Home className="w-6 h-6" />
    </button>
  );
};



