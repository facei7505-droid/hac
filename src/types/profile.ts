export interface Achievement {
  id: string;
  title: string;
  category: string;
  icon: string;
  status: "approved" | "pending";
  date: string;
  studentId?: string;
  fileUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "student" | "teacher";
  grade?: string;
  email: string;
  avatar: string;
  mmr?: number;
  bio: string;
  interests: string[];
  achievements: Achievement[];
  activityGrid: number[];
  subjects?: string[];
  curatorOf?: string;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
