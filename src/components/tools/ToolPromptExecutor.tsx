
import React, { useState } from "react";
import { Rocket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tool } from "../../data/mockData";

interface ToolPromptExecutorProps {
  tool: Tool;
  onExecute: (prompt: string) => void;
  result: string | null;
}

const ToolPromptExecutor: React.FC<ToolPromptExecutorProps> = ({ 
  tool, 
  onExecute,
  result 
}) => {
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleExecute = () => {
    if (!prompt.trim()) return;
    
    setIsExecuting(true);
    // Simulate API call
    setTimeout(() => {
      onExecute(prompt);
      setIsExecuting(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-4">Try {tool.title}</h3>
        
        {tool.promptTemplate && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-4 flex items-start">
            <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Prompt Template</p>
              <p className="text-sm">{tool.promptTemplate}</p>
            </div>
          </div>
        )}
        
        <Textarea
          placeholder={`Enter your prompt here...`}
          className="mb-4 min-h-[150px]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <Button 
          onClick={handleExecute} 
          disabled={!prompt.trim() || isExecuting}
          className="gap-2"
        >
          <Rocket className="h-4 w-4" />
          {isExecuting ? "Processing..." : "Execute"}
        </Button>
      </div>
      
      {result && (
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-medium mb-4">Result</h3>
          <div className="bg-background border rounded-md p-4 whitespace-pre-line">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolPromptExecutor;
