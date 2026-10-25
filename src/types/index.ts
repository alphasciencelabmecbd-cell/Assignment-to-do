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
  | 'Grand Finale'
  | string;

export type AllowedFormat = 'github' | 'video' | 'document' | 'image' | 'pptx';

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'evaluated';

export type ResourceType = 'youtube' | 'pdf' | 'pptx' | 'image' | 'link';

export interface TaskResource {
  id?: string;
  type: ResourceType;
  title: string;
  url: string;
}

export interface Task {
  id: number;
  title: string;
  short_title: string;
  category: TaskCategory;
  description: string;
  points: number;
  deadline?: string;
  allowed_formats: AllowedFormat[];
  deliverables: string[];
  youtube_url?: string | null;
  resources?: TaskResource[];
  created_at?: string;
  submissionCount?: number;
  evaluatedCount?: number;
  avgScore?: number | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  batch: string | null;
  registration_number: string | null;
  team_name?: string | null;
  institution?: string | null;
  track?: string | null;
  role: 'participant' | 'judge' | 'admin';
  is_verified?: boolean;
  account_status?: 'active' | 'pending' | 'suspended';
  submissions_count?: number;
  evaluated_count?: number;
  total_score?: number;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
}

export interface Submission {
  id: string;
  user_id: string;
  task_id: number;
  team_name?: string | null;
  status: SubmissionStatus;
  video_url?: string | null;
  video_file_name?: string | null;
  document_url?: string | null;
  image_url?: string | null;
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
  // Join fields
  profile?: UserProfile;
  task?: Task;
}

export interface Project {
  id?: string;
  title: string;
  subtitle?: string | null;
  description: string;
  category: string;
  image_url?: string | null;
  tags?: string[];
  status?: string;
  color?: string | null;
  link?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  registration_number: string;
  department: string;
  batch: string;
  team_name?: string;
  institution?: string;
  track?: string;
  tasks_completed: number;
  total_score: number;
  last_submission_time: string;
}

export type NavigationTab = 'overview' | 'tasks' | 'submissions' | 'leaderboard' | 'rules' | 'admin';
