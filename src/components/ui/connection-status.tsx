
import React from "react";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  status: 'connected' | 'disconnected' | 'checking' | 'unconfigured';
  className?: string;
};

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "connected":
        return "bg-green-500 text-white";
      case "disconnected":
        return "bg-orange-500 text-white";
      case "checking":
        return "bg-blue-500 text-white";
      case "unconfigured":
        return "bg-gray-400 text-white";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected to Cloud";
      case "disconnected":
        return "Offline";
      case "checking":
        return "Checking Connection...";
      case "unconfigured":
        return "Unconfigured";
    }
  };

  return (
    <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center", getStatusStyles(), className)}>
      <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
      {getStatusText()}
    </div>
  );
}
