import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePacts } from "@/context/PactContext";
import { useAuth } from "@/context/AuthContext";
import { ProofType } from "@/types";
import { ImagePlus, Check, X } from "lucide-react";
import SuccessAnimation from "./SuccessAnimation";
import { uploadProofImageForPact } from "@/lib/services/pactService";

interface ProofDialogProps {
  pactId: string;
  date: string;
  proofType: ProofType;
  onComplete: () => void;
}

const ProofDialog: React.FC<ProofDialogProps> = ({ pactId, date, proofType, onComplete }) => {
  const [open, setOpen] = useState(false);
  const [textProof, setTextProof] = useState("");
  const [imageProof, setImageProof] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { addPactCompletion, addPactLog } = usePacts();
  const { activeUser } = useAuth();

  const handleComplete = async () => {
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

    try {
      // Handle image upload if needed
      let proofUrl = imageProof;
      if (proofType === "image" && imageProof.startsWith("blob:")) {
        const response = await fetch(imageProof);
        const blob = await response.blob();
        const file = new File([blob], "proof.jpg", { type: "image/jpeg" });
        proofUrl = await uploadProofImageForPact(file);
      }

      // Add the completion proof
      await addPactCompletion({
        pactId,
        userId: activeUser?.id || "user_a",
        status: "completed",
        proofType,
        proofUrl: proofUrl || textProof,
        note: textProof
      });

      toast({
        title: "Success!",
        description: "Your task has been marked as complete."
      });

      setSuccess(true);
      
      // Close after animation
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to save completion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFailure = async () => {
    try {
      await addPactCompletion({
        pactId,
        userId: activeUser?.id || "user_a",
        status: "failed",
        note: textProof
      });

      toast({
        title: "Task Failed",
        description: "The task has been marked as incomplete.",
        variant: "destructive"
      });

      setOpen(false);
      onComplete();
    } catch (error) {
      console.error("Error marking task as failed:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For simplicity in this demo, we're just storing the filename
    // In a real app, you would upload to a service and store the URL
    setImageProof(URL.createObjectURL(file));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div className="text-center py-10">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Task Completed!</h3>
              <p className="text-muted-foreground">
                Your task has been marked as complete.
              </p>
            </div>
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
