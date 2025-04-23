
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);
  
  return null;
};

export default Index;
