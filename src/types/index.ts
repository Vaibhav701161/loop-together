
export type User = {
  id: "user_a" | "user_b";
  name: string;
  avatar?: string;
}

export type ProofType = "text" | "checkbox" | "image";

export type Frequency = "daily" | "weekly" | "one-time";

export type Assignment = "user_a" | "user_b" | "both";

export type Pact = {
  id: string;
  title: string;
  description?: string;
  frequency: Frequency;
  assignedTo: Assignment;
  proofType: ProofType;
  deadline: string; // HH:MM format
  maxFailCount: number;
  punishment: string;
  reward: string;
  createdAt: string;
  color?: string;
}

export type CompletionStatus = "completed" | "failed" | "pending";

export type PactLog = {
  id: string;
  pactId: string;
  userId: User["id"];
  date: string; // YYYY-MM-DD
  status: CompletionStatus;
  proof?: {
    type: ProofType;
    content: string; // text content or base64 image
  };
  completedAt?: string;
}

export type Streak = {
  pactId: string;
  current: number;
  longest: number;
  total: number;
}

export type Note = {
  id: string;
  fromUserId: User["id"];
  toUserId: User["id"];
  content: string;
  color: string;
  createdAt: string;
}
