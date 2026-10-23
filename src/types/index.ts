export type TaskCategory = 
  | 'Ideation & Research'
  | 'Design & Architecture'
  | 'Mechanical & Physical'
  | 'Software Development'
  | 'Milestone Evaluation'
  | 'Demonstration'
  | 'Data Science & AI'
  | 'Validation & Quality'
  | 'Presentation & Business'
  | 'Grand Finale';

export type AllowedFormat = 'video' | 'pptx' | 'github' | 'document';

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'evaluated';

export interface Task {
  id: number;
  title: string;
  short_title: string;
  category: TaskCategory;
  description: string;
  points: number;
  deadline: string;
  allowed_formats: AllowedFormat[];
  deliverables: string[];
  created_at?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  task_id: number;
  team_name?: string | null;
  status: SubmissionStatus;
  video_url?: string | null;
  video_file_name?: string | null;
  pptx_url?: string | null;
  pptx_file_name?: string | null;
  pptx_file_size?: number | null;
  github_url?: string | null;
  github_branch?: string | null;
  notes?: string | null;
  score?: number | null;
  feedback?: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  team_name: string | null;
  institution: string | null;
  track: string | null;
  role: 'participant' | 'judge' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  institution: string;
  track: string;
  tasks_completed: number;
  total_score: number;
  last_submission_time: string;
}
