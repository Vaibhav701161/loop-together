import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Frequency, Assignment, ProofType } from "@/types";
import { usePacts } from "@/context/PactContext";
import { CheckCircle2, AlarmClock } from "lucide-react";

const CreatePact: React.FC = () => {
  const { addPact } = usePacts();
  const { toast } = useToast();
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
  const [color, setColor] = useState("#8B5CF6");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addPact({
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
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString().split('T')[0]
    });
    
    toast({
      title: "Pact Created!",
      description: "Your new pact has been created successfully.",
    });
    
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 gradient-heading">Create New Pact</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Pact Details</CardTitle>
            <CardDescription>
              Define the terms of your new 2getherLoop pact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Daily Exercise"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief explanation of the pact"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as Frequency)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="one-time">One-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={assignedTo} onValueChange={(value) => setAssignedTo(value as Assignment)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_a">Person A</SelectItem>
                    <SelectItem value="user_b">Person B</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="proofType">Proof Type</Label>
                <Select value={proofType} onValueChange={(value) => setProofType(value as ProofType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <div className="relative">
                  <AlarmClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="time"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxFailCount">Max Fail Count</Label>
                <Input
                  type="number"
                  id="maxFailCount"
                  value={maxFailCount.toString()}
                  onChange={(e) => setMaxFailCount(parseInt(e.target.value))}
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <Label htmlFor="punishment">Punishment</Label>
                <Input
                  type="text"
                  id="punishment"
                  value={punishment}
                  onChange={(e) => setPunishment(e.target.value)}
                  placeholder="e.g., Do the dishes"
                />
              </div>
              <div>
                <Label htmlFor="reward">Reward</Label>
                <Input
                  type="text"
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="e.g., Movie night"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-couple-purple to-couple-pink">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Pact
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreatePact;
