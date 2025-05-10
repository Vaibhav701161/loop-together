
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ConnectionAlertProps {
  isDisconnected: boolean;
  isConfigured: boolean;
}

const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ isDisconnected, isConfigured }) => {
  if (!(isDisconnected && isConfigured)) {
    return null;
  }

  return (
    <Alert className="mb-6" variant="default">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connecting to Cloud...</AlertTitle>
      <AlertDescription>
        Your data is currently stored locally. Your changes will be synced when connection is established.
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionAlert;
