
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { hasValidSupabaseCredentials, initSupabaseSchema, getSupabaseClient } from './lib/supabase.ts';

// Use default credentials for development environment
const defaultCredentials = {
  url: 'https://vagdcjyvhiwcbsdjttvk.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZ2RjanlkaGl3Y2JzZGp0dHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg3ODQ1NTIsImV4cCI6MjAyNDM2MDU1Mn0.NDm7ROOGUqp9O-YxKT1BvuoRWHBYwCMWMQ_WgMEDCBo'
};

// Set default credentials if none exist
if (!localStorage.getItem("VITE_SUPABASE_URL")) {
  localStorage.setItem("VITE_SUPABASE_URL", defaultCredentials.url);
}
if (!localStorage.getItem("VITE_SUPABASE_ANON_KEY")) {
  localStorage.setItem("VITE_SUPABASE_ANON_KEY", defaultCredentials.key);
}

// Force a client refresh and initialize schema
if (hasValidSupabaseCredentials()) {
  console.log('Initializing database connection...');
  getSupabaseClient();
  
  initSupabaseSchema().catch(err => {
    console.error('Failed to initialize Supabase schema:', err);
  });
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
