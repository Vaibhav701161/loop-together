
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Initialize env variables if needed
const envVariables = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

// Log config status for debugging
if (!envVariables.VITE_SUPABASE_URL || !envVariables.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are not properly set. App will run in local storage mode.');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
