
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface WelcomeSurveyProps {
  onClose: () => void;
  onComplete: () => void;
}

const WelcomeSurvey: React.FC<WelcomeSurveyProps> = ({ onClose, onComplete }) => {
  const [open, setOpen] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleComplete = () => {
    // Here you would typically send survey data to your backend
    console.log("Survey completed:", { userType, interests });
    onComplete();
    setOpen(false);
  };
  
  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open) onClose();
  };
  
  const handleInterestChange = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };
  
  const steps = [
    // Step 1: User Type
    <div key="step-1" className="py-4">
      <DialogDescription className="mb-6">
        Help us personalize your experience by telling us who you are:
      </DialogDescription>
      <RadioGroup value={userType || ""} onValueChange={setUserType}>
        <div className="flex items-center space-x-2 mb-4">
          <RadioGroupItem value="end-user" id="end-user" />
          <Label htmlFor="end-user" className="cursor-pointer">
            <div>
              <p className="font-medium">End User</p>
              <p className="text-sm text-muted-foreground">I want to discover and use AI tools</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="developer" id="developer" />
          <Label htmlFor="developer" className="cursor-pointer">
            <div>
              <p className="font-medium">Developer</p>
              <p className="text-sm text-muted-foreground">I want to publish and monetize my AI tools</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>,
    
    // Step 2: Interests
    <div key="step-2" className="py-4">
      <DialogDescription className="mb-6">
        What types of AI tools are you interested in?
      </DialogDescription>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: "writing", label: "Content Writing" },
          { id: "design", label: "Design & Creativity" },
          { id: "analysis", label: "Data Analysis" },
          { id: "marketing", label: "Marketing" },
          { id: "development", label: "Development" },
          { id: "productivity", label: "Productivity" },
        ].map(interest => (
          <div key={interest.id} className="flex items-center space-x-2">
            <Checkbox 
              id={interest.id}
              checked={interests.includes(interest.id)}
              onCheckedChange={() => handleInterestChange(interest.id)}
            />
            <Label htmlFor={interest.id}>{interest.label}</Label>
          </div>
        ))}
      </div>
    </div>,
  ];
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to AI ToolKart</DialogTitle>
        </DialogHeader>
        
        {steps[currentStep]}
        
        <DialogFooter className="flex justify-between">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Skip
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)} 
                disabled={currentStep === 0 && !userType}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Finish
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeSurvey;
