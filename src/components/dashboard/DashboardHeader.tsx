
import React from "react";
import { format } from "date-fns";
import { ConnectionStatus } from "@/components/ui/connection-status";

interface DashboardHeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'checking' | 'unconfigured';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ connectionStatus }) => {
  const today = format(new Date(), "EEEE, MMMM do");

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold gradient-heading">Today's Dashboard</h1>
        <ConnectionStatus status={connectionStatus} />
      </div>
      <p className="text-muted-foreground mb-6">{today}</p>
    </>
  );
};

export default DashboardHeader;
