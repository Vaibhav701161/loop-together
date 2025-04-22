
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePacts } from "@/context/PactContext";
import { Assignment, Frequency, ProofType } from "@/types";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";

const colorOptions = [
  { value: "bg-red-500", label: "Red" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-orange-500", label: "Orange" },
];

const CreatePact: React.FC = () => {
  const { users } = useAuth();
  const { addPact } = usePacts();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [assignedTo, setAssignedTo] = useState<Assignment>("both");
  const [proofType, setProofType] = useState<ProofType>("checkbox");
  const [deadline, setDeadline] = useState("21:00");
  const [maxFailCount, setMaxFailCount] = useState(3);
  const [punishment, setPunishment] = useState("");
  const [reward, setReward] = useState("");
  const [color, setColor] = useState(colorOptions[4].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPactId = addPact({
      title,
      description,
      frequency,
      assignedTo,
      proofType,
      deadline,
      maxFailCount,
      punishment,
      reward,
      color,
    });
    
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 gradient-heading">Create New Pact</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Daily Exercise, No Sugar, etc."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this pact..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline Time</Label>
                  <Input
                    id="deadline"
                    type="time"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Assignment & Proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Who is assigned to this pact?</Label>
                <RadioGroup 
                  value={assignedTo} 
                  onValueChange={(v) => setAssignedTo(v as Assignment)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user_a" id="user_a" />
                    <Label htmlFor="user_a" className="font-normal">
                      {users[0]?.name || "Person A"} only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user_b" id="user_b" />
                    <Label htmlFor="user_b" className="font-normal">
                      {users[1]?.name || "Person B"} only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="font-normal">
                      Both of us
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>What type of proof is required?</Label>
                <RadioGroup 
                  value={proofType} 
                  onValueChange={(v) => setProofType(v as ProofType)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkbox" id="checkbox" />
                    <Label htmlFor="checkbox" className="font-normal">
                      Simple checkbox (honor system)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="font-normal">
                      Text description
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="font-normal">
                      Photo/Screenshot proof
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxFailCount">Maximum Failure Count</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="maxFailCount"
                    type="number"
                    min={1}
                    max={10}
                    value={maxFailCount}
                    onChange={(e) => setMaxFailCount(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    times before punishment
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rewards & Punishments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reward">Reward for Completion</Label>
                <Textarea
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="What's the reward for completing this pact?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="punishment">Punishment for Failing</Label>
                <Textarea
                  id="punishment"
                  value={punishment}
                  onChange={(e) => setPunishment(e.target.value)}
                  placeholder="What's the punishment for failing this pact?"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Choose a color for this pact</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option) => (
                    <Toggle
                      key={option.value}
                      pressed={color === option.value}
                      onPressedChange={() => setColor(option.value)}
                      className={`w-8 h-8 rounded-full ${option.value}`}
                      aria-label={option.label}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit">Create Pact</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePact;
