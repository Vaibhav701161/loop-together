
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-couple-purple/20 to-couple-light-pink/30">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 gradient-heading">404</h1>
        <p className="text-2xl mb-6">Oops! We couldn't find that page.</p>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate("/")} size="lg">
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
