
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Header: React.FC = () => {
  const { activeUser, logout, switchUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold flex items-center gap-1 gradient-heading">
          <span className="text-2xl">👫</span> 2getherLoop
        </h1>
      </div>

      <div className="flex-1 mx-4">
        {!isMobile && (
          <nav className="flex justify-center gap-4">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              onClick={() => navigate("/")}
            >
              Dashboard
            </Button>
            <Button
              variant={isActive("/create") ? "default" : "ghost"}
              onClick={() => navigate("/create")}
            >
              Create Pact
            </Button>
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              onClick={() => navigate("/history")}
            >
              History
            </Button>
            <Button
              variant={isActive("/notes") ? "default" : "ghost"}
              onClick={() => navigate("/notes")}
            >
              Notes
            </Button>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeUser && (
          <span className="text-sm font-medium">
            {activeUser.name}
          </span>
        )}
        <Button size="sm" variant="outline" onClick={switchUser}>
          Switch
        </Button>
        <Button size="sm" variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
