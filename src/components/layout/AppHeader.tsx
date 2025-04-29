
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { useConnectionStatus } from "../ui/connection-status";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const connectionStatus = useConnectionStatus();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Temporary login simulation - replace with actual auth
  React.useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    setIsLoggedIn(!!userToken);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <header className="bg-background border-b border-border py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        {/* Logo and site name */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-1">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-bold gradient-heading">ToolKart</span>
          </Link>
        </div>

        {/* Search bar - visible on medium devices and up */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search AI tools..."
              className="w-full pl-9 bg-background"
            />
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <User className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleLogin} className="hidden sm:flex">
                Log In
              </Button>
              <Button onClick={handleSignUp}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile search - visible on small devices */}
      <div className="mt-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search AI tools..."
            className="w-full pl-9 bg-background"
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
