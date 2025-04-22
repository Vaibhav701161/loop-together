
export type User = {
  id: "user_a" | "user_b";
  name: string;
  avatar?: string;
}

export type ProofType = "text" | "checkbox" | "image";

export type Frequency = "daily" | "weekly" | "one-time";

export type Assignment = "user_a" | "user_b" | "both";

export type PactTemplate = {
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
  color?: string;
  createdBy: User["id"];
  createdAt: string;
}

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
  isVerified?: boolean;
  templateId?: string;
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
  verifiedBy?: User["id"];
  verifiedAt?: string;
  comment?: string;
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
  isPinned?: boolean;
  emoji?: string;
}

export type Expense = {
  id: string;
  userId: User["id"];
  amount: number;
  date: string; // YYYY-MM-DD
  category?: string;
  description?: string;
  imageProof?: string; // base64 image
}

export type StudyTask = {
  id: string;
  title: string;
  description?: string;
  assignedBy: User["id"];
  assignedTo: User["id"];
  deadline: string; // deadline time
  status: CompletionStatus;
  date: string; // YYYY-MM-DD
  proof?: string;
  comment?: string;
  createdAt: string;
}

export type GymVisit = {
  id: string;
  userId: User["id"];
  date: string; // YYYY-MM-DD
  comment?: string;
}

export type Milestone = {
  id: string;
  title: string;
  description?: string;
  targetDays: number;
  pactType: string;
  reward: string;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}
