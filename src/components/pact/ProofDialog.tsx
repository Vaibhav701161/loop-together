
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
import { format, parseISO } from "date-fns";
import { Image, X, Check, Camera } from "lucide-react";
import confetti from 'canvas-confetti';

interface ProofDialogProps {
  pact: Pact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProofDialog: React.FC<ProofDialogProps> = ({ pact, open, onOpenChange }) => {
  const { addPactLog, getPactStatus, isPactLost } = usePacts();
  const { activeUser, users } = useAuth();
  const [textProof, setTextProof] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [comment, setComment] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const isPactAlreadyCompleted = getPactStatus(pact.id, activeUser?.id || "", today) === "completed";
  const pactLost = isPactLost(pact.id, activeUser?.id || "");

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
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
      },
      comment: comment
    });

    // Trigger confetti animation on successful completion
    triggerConfetti();

    // Reset form and close dialog
    setTextProof("");
    setIsChecked(false);
    setImagePreview(null);
    setComment("");
    onOpenChange(false);
  };

  const handleFail = () => {
    if (!activeUser) return;

    addPactLog({
      pactId: pact.id,
      userId: activeUser.id,
      date: today,
      status: "failed",
      comment: comment
    });

    // Reset form and close dialog
    setTextProof("");
    setIsChecked(false);
    setImagePreview(null);
    setComment("");
    onOpenChange(false);
  };

  const otherUser = users.find(u => u.id !== activeUser?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{pact.title}</DialogTitle>
          <DialogDescription>
            {pact.description || "Complete this pact by providing proof below."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isPactAlreadyCompleted ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center">
              <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-green-700 dark:text-green-300 font-medium">
                You've already completed this pact today!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Good job keeping your streak going!
              </p>
            </div>
          ) : pactLost ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-center">
              <X className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <p className="text-red-700 dark:text-red-300 font-medium">
                You've lost this pact!
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {pact.punishment || "Time to face the consequences."}
              </p>
            </div>
          ) : (
            <>
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
                  <Label htmlFor="image-proof" className="flex items-center gap-2">
                    <Image className="h-4 w-4" /> Upload proof image
                  </Label>
                  
                  <div className="grid gap-2">
                    <Input
                      id="image-proof"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 hover:file:bg-primary/90"
                    />
                    
                    {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    
                    {imagePreview && (
                      <div className="mt-2">
                        <div className="relative border rounded-md overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Proof preview" 
                            className="max-h-[200px] w-full object-contain mx-auto"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                            {format(new Date(), "PPp")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="comment">Additional comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any additional information..."
                  className="min-h-[60px]"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!isPactAlreadyCompleted && !pactLost && (
            <>
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
            </>
          )}
          {(isPactAlreadyCompleted || pactLost) && (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProofDialog;
