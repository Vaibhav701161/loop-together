
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { hasValidSupabaseCredentials, initSupabaseSchema, getSupabaseClient } from './lib/supabase.ts';

// Initialize env variables if needed
const envVariables = {
  VITE_SUPABASE_URL: localStorage.getItem("VITE_SUPABASE_URL") || import.meta.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: localStorage.getItem("VITE_SUPABASE_ANON_KEY") || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

// Log config status for debugging
if (hasValidSupabaseCredentials()) {
  console.log('Supabase configuration detected:', {
    url: envVariables.VITE_SUPABASE_URL.substring(0, 10) + '...',
    hasKey: !!envVariables.VITE_SUPABASE_ANON_KEY
  });
  
  // Force a client refresh to make sure we're using the latest credentials
  getSupabaseClient();
  
  initSupabaseSchema().catch(err => {
    console.error('Failed to initialize Supabase schema:', err);
  });
} else {
  console.warn('Supabase environment variables are not properly set. App will run in local storage mode.');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
