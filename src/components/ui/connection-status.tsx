
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CloudOff, AlertCircle } from "lucide-react";
import { checkSupabaseConnection, hasValidSupabaseCredentials } from "@/lib/supabase";

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'checking' | 'unconfigured';
  className?: string;
}

export function ConnectionStatus({ status, className = "" }: ConnectionStatusProps) {
  if (status === 'connected') {
    return (
      <Badge variant="outline" className={`bg-green-50 text-green-800 border-green-300 ${className}`}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }
  
  if (status === 'disconnected') {
    return (
      <Badge variant="outline" className={`bg-amber-50 text-amber-800 border-amber-300 ${className}`}>
        <CloudOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  }
  
  if (status === 'unconfigured') {
    return (
      <Badge variant="outline" className={`bg-red-50 text-red-800 border-red-300 ${className}`}>
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Configured
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`bg-blue-50 text-blue-800 border-blue-300 ${className}`}>
      <AlertCircle className="h-3 w-3 mr-1" />
      Checking...
    </Badge>
  );
}

// Hook to monitor connection status
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking' | 'unconfigured'>('checking');
  
  useEffect(() => {
    const checkConnection = async () => {
      // First check if Supabase is configured
      if (!hasValidSupabaseCredentials()) {
        setStatus('unconfigured');
        return;
      }
      
      setStatus('checking');
      const isConnected = await checkSupabaseConnection();
      setStatus(isConnected ? 'connected' : 'disconnected');
    };
    
    checkConnection();
    
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return status;
}
