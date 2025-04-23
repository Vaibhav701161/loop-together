
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// This file is kept as a compatibility layer while we migrate to Supabase
// It re-exports the SupabaseContext functionality

import { SupabaseProvider, useSupabase } from "./SupabaseContext";

export const FirebaseContext = createContext<any>(undefined);

export const useFirebase = () => {
  // Use Supabase instead
  return useSupabase();
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Just use SupabaseProvider
  return <SupabaseProvider>{children}</SupabaseProvider>;
};
