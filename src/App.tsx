
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PactProvider } from "@/context/PactContext";
import { NotesProvider } from "@/context/NotesContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CreatePact from "./pages/CreatePact";
import History from "./pages/History";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import WeeklySpend from "./pages/WeeklySpend";
import StudyTracker from "./pages/StudyTracker";
import GymTracker from "./pages/GymTracker";
import PactTimeline from "./pages/PactTimeline";
import Comparison from "./pages/Comparison";
import Milestones from "./pages/Milestones";
import Settings from "./pages/Settings";
import MediaGallery from "./pages/MediaGallery";
import { ReminderProvider } from "./context/ReminderContext";
import { useEffect, useState } from "react";
import { hasValidSupabaseCredentials } from "./lib/supabase";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Apply the saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem("2getherLoop_theme") || "light";
    document.documentElement.classList.add(savedTheme);
  }, []);
  
  return <>{children}</>;
};

// Component to handle Supabase configuration status
const SupabaseConfigurationCheck = ({ children }: { children: React.ReactNode }) => {
  const [isChecked, setIsChecked] = useState(false);
  
  useEffect(() => {
    // Check if Supabase is configured and redirect if needed
    const isConfigured = hasValidSupabaseCredentials();
    setIsChecked(true);
    
    if (!isConfigured) {
      console.warn("Supabase is not configured properly. Using local storage only.");
    }
  }, []);
  
  if (!isChecked) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Loading application...</p>
      </div>
    </div>;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreatePact /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/weekly-spend" element={<ProtectedRoute><WeeklySpend /></ProtectedRoute>} />
      <Route path="/study" element={<ProtectedRoute><StudyTracker /></ProtectedRoute>} />
      <Route path="/gym" element={<ProtectedRoute><GymTracker /></ProtectedRoute>} />
      <Route path="/timeline" element={<ProtectedRoute><PactTimeline /></ProtectedRoute>} />
      <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
      <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/gallery" element={<ProtectedRoute><MediaGallery /></ProtectedRoute>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer>
        <SupabaseConfigurationCheck>
          <AuthProvider>
            <PactProvider>
              <NotesProvider>
                <ReminderProvider>
                  <Toaster />
                  <Sonner />
                  <AppRoutes />
                </ReminderProvider>
              </NotesProvider>
            </PactProvider>
          </AuthProvider>
        </SupabaseConfigurationCheck>
      </ThemeInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
