
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CloudOff, AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'checking';
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
  
  return (
    <Badge variant="outline" className={`bg-blue-50 text-blue-800 border-blue-300 ${className}`}>
      <AlertCircle className="h-3 w-3 mr-1" />
      Checking...
    </Badge>
  );
}
