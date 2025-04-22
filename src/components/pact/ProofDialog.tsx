
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Pact } from "@/types";
import { usePacts } from "@/context/PactContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface ProofDialogProps {
  pact: Pact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProofDialog: React.FC<ProofDialogProps> = ({ pact, open, onOpenChange }) => {
  const { addPactLog } = usePacts();
  const { activeUser } = useAuth();
  const [textProof, setTextProof] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!activeUser) return;

    let proofContent = "";
    
    switch (pact.proofType) {
      case "text":
        proofContent = textProof;
        break;
      case "checkbox":
        proofContent = isChecked ? "completed" : "";
        break;
      case "image":
        proofContent = imagePreview || "";
        break;
    }

    addPactLog({
      pactId: pact.id,
      userId: activeUser.id,
      date: today,
      status: "completed",
      proof: {
        type: pact.proofType,
        content: proofContent
      }
    });

    // Reset form and close dialog
    setTextProof("");
    setIsChecked(false);
    setImagePreview(null);
    onOpenChange(false);
  };

  const handleFail = () => {
    if (!activeUser) return;

    addPactLog({
      pactId: pact.id,
      userId: activeUser.id,
      date: today,
      status: "failed"
    });

    // Reset form and close dialog
    setTextProof("");
    setIsChecked(false);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{pact.title}</DialogTitle>
          <DialogDescription>
            {pact.description || "Complete this pact by providing proof below."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {pact.proofType === "text" && (
            <div className="grid gap-2">
              <Label htmlFor="text-proof">Provide text proof</Label>
              <Textarea
                id="text-proof"
                value={textProof}
                onChange={(e) => setTextProof(e.target.value)}
                placeholder="Describe how you completed this task..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {pact.proofType === "checkbox" && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="check-proof" 
                checked={isChecked} 
                onCheckedChange={(checked) => setIsChecked(checked === true)}
              />
              <Label htmlFor="check-proof">I confirm that I have completed this task</Label>
            </div>
          )}

          {pact.proofType === "image" && (
            <div className="grid gap-4">
              <Label htmlFor="image-proof">Upload proof image</Label>
              
              <Input
                id="image-proof"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Proof preview" 
                    className="max-h-[200px] rounded-md object-contain mx-auto border"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleFail} className="sm:w-1/2">
            Failed Today
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              (pact.proofType === "text" && !textProof) ||
              (pact.proofType === "checkbox" && !isChecked) ||
              (pact.proofType === "image" && !imagePreview) ||
              isUploading
            }
            className="sm:w-1/2"
          >
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProofDialog;
