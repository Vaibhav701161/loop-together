
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-20 px-4">
      <div className="text-6xl font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          Go to Homepage
        </Button>
        <Button onClick={() => navigate("/")} variant="secondary">
          <Search className="mr-2 h-4 w-4" />
          Browse Tools
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
