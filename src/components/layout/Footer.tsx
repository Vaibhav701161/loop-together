
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Footer: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isLoggedIn || !isMobile) {
    return (
      <footer className="bg-muted py-2 text-center text-sm text-muted-foreground">
        <p>Made with 💖 for couples by 2getherLoop</p>
      </footer>
    );
  }

  return (
    <footer className="bg-white fixed bottom-0 left-0 right-0 border-t border-border shadow-lg">
      <nav className="flex justify-around items-center">
        <Button
          variant={isActive("/") ? "default" : "ghost"}
          onClick={() => navigate("/")}
          className="flex-1 rounded-none py-6"
        >
          🏠 Home
        </Button>
        <Button
          variant={isActive("/create") ? "default" : "ghost"}
          onClick={() => navigate("/create")}
          className="flex-1 rounded-none py-6"
        >
          ➕ Create
        </Button>
        <Button
          variant={isActive("/history") ? "default" : "ghost"}
          onClick={() => navigate("/history")}
          className="flex-1 rounded-none py-6"
        >
          📊 History
        </Button>
        <Button
          variant={isActive("/notes") ? "default" : "ghost"}
          onClick={() => navigate("/notes")}
          className="flex-1 rounded-none py-6"
        >
          📝 Notes
        </Button>
      </nav>
    </footer>
  );
};

export default Footer;
