
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Don't apply normal layout to landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
