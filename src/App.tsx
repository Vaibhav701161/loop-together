
import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Pages
import Marketplace from "./pages/Marketplace";
import ToolDetails from "./pages/ToolDetails";
import Dashboard from "./pages/Dashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Layout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/tool/:id" element={<ToolDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/developer" element={<DeveloperDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
