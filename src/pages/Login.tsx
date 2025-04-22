
import React from "react";
import { AuthTabs } from "@/components/auth/AuthForms";
import { useAuth } from "@/context/AuthContext";

const Login: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold gradient-heading">2getherLoop</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 gradient-heading">Welcome to 2getherLoop</h2>
            <p className="text-muted-foreground">
              Keep each other accountable and build better habits together.
            </p>
          </div>
          
          <AuthTabs />
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>By using this app, you agree to our terms of service and privacy policy.</p>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} 2getherLoop. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;
