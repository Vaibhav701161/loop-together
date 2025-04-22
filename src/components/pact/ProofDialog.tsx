
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePacts } from "@/context/PactContext";
import { useAuth } from "@/context/AuthContext";
import { ProofType, Pact } from "@/types";
import { ImagePlus, Check, X } from "lucide-react";
import SuccessAnimation from "./SuccessAnimation";

interface ProofDialogProps {
  pactId: string;
  date: string;
  proofType: ProofType;
  onComplete: () => void;
}

const ProofDialog: React.FC<ProofDialogProps & { open?: boolean; onOpenChange?: (open: boolean) => void; pact?: Pact }> = ({ 
  pactId, 
  date, 
  proofType, 
  onComplete,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  pact
}) => {
  const [open, setOpen] = useState(false);
  const [textProof, setTextProof] = useState("");
  const [imageProof, setImageProof] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { addPactCompletion, addPactLog } = usePacts();
  const { activeUser } = useAuth();

  const handleComplete = () => {
    if (proofType === "text" && !textProof.trim()) {
      toast({
        title: "Proof Required",
        description: "Please provide a text description of your completed task."
      });
      return;
    }

    if (proofType === "image" && !imageProof) {
      toast({
        title: "Proof Required",
        description: "Please upload an image as proof of completion."
      });
      return;
    }

    // Add the completion proof
    let proofData = "";
    
    if (proofType === "text") {
      proofData = textProof;
    } else if (proofType === "image") {
      proofData = imageProof;
    }
    
    addPactCompletion(pactId, activeUser?.id || "user_a", {
      proofType,
      proofUrl: proofData,
      note: textProof
    });

    // Add a log entry
    addPactLog({
      pactId,
      userId: activeUser?.id || "user_a",
      date,
      status: "completed",
      completedAt: new Date().toISOString(),
      comment: textProof
    });

    setSuccess(true);
    
    // Close after animation
    setTimeout(() => {
      if (externalOnOpenChange) {
        externalOnOpenChange(false);
      } else {
        setOpen(false);
      }
      setSuccess(false);
      onComplete();
    }, 2000);
  };

  const handleFailure = () => {
    addPactLog({
      pactId,
      userId: activeUser?.id || "user_a",
      date,
      status: "failed",
      completedAt: new Date().toISOString(),
      comment: textProof
    });
    
    if (externalOnOpenChange) {
      externalOnOpenChange(false);
    } else {
      setOpen(false);
    }
    
    toast({
      title: "Marked as Failed",
      description: "You've logged this task as incomplete."
    });
    onComplete();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For simplicity in this demo, we're just storing the filename
    // In a real app, you would upload to a service and store the URL
    setImageProof(URL.createObjectURL(file));
  };

  // If external open state is provided, use it instead of internal state
  const dialogOpen = externalOpen !== undefined ? externalOpen : open;
  const setDialogOpen = externalOnOpenChange || setOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {proofType === "checkbox" ? (
            <span className="flex items-center">
              <Check className="mr-1 h-4 w-4" /> Mark Complete
            </span>
          ) : (
            <span className="flex items-center">
              <ImagePlus className="mr-1 h-4 w-4" /> Add Proof
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <SuccessAnimation show={true}>
            <div>Task completed successfully!</div>
          </SuccessAnimation>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Complete Task</DialogTitle>
              <DialogDescription>
                {proofType === "checkbox" 
                  ? "Mark this task as completed." 
                  : "Provide proof that you've completed this task."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {proofType === "text" && (
                <div className="grid gap-2">
                  <Label htmlFor="proof">Describe how you completed this task</Label>
                  <Textarea 
                    id="proof" 
                    placeholder="e.g., I went to the gym and did a full workout routine..."
                    value={textProof}
                    onChange={(e) => setTextProof(e.target.value)}
                  />
                </div>
              )}
              
              {proofType === "image" && (
                <div className="grid gap-4">
                  <Label htmlFor="image">Upload an image as proof</Label>
                  <div className="flex flex-col items-center gap-2">
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {imageProof && (
                      <div className="mt-2 relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                        <img 
                          src={imageProof} 
                          alt="Proof" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Textarea 
                    placeholder="Optional: Add a note about your completion"
                    value={textProof}
                    onChange={(e) => setTextProof(e.target.value)}
                  />
                </div>
              )}
              
              {proofType === "checkbox" && (
                <div className="grid gap-2">
                  <Label htmlFor="note">Optional: Add a note</Label>
                  <Textarea 
                    id="note" 
                    placeholder="e.g., Completed with extra effort today!"
                    value={textProof}
                    onChange={(e) => setTextProof(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-row justify-between sm:justify-between">
              <Button variant="outline" onClick={handleFailure} type="button">
                <X className="mr-2 h-4 w-4" />
                Mark Failed
              </Button>
              <Button onClick={handleComplete} type="button">
                <Check className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProofDialog;
