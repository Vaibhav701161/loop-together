
import React from "react";
import { useConnectionStatus } from "../ui/connection-status";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import AppFooter from "./AppFooter";
import WelcomeSurvey from "../survey/WelcomeSurvey";
import { useLocalStorage } from "../../hooks/use-local-storage";

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const connectionStatus = useConnectionStatus();
  const [hasCompletedSurvey, setHasCompletedSurvey] = useLocalStorage("hasCompletedSurvey", false);
  const [showSurvey, setShowSurvey] = React.useState(false);
  
  React.useEffect(() => {
    // Show survey after 3 seconds if it hasn't been completed
    if (!hasCompletedSurvey) {
      const timer = setTimeout(() => {
        setShowSurvey(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedSurvey]);

  const handleSurveyComplete = () => {
    setHasCompletedSurvey(true);
    setShowSurvey(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <AppFooter />
      
      {showSurvey && (
        <WelcomeSurvey 
          onClose={() => setShowSurvey(false)}
          onComplete={handleSurveyComplete}
        />
      )}
    </div>
  );
};

export default AppLayout;
