const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.SUPABASE_PROJECT_REF || 'epqwjnsauwrjlvplkjoa';

const sqlScript = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  team_name TEXT,
  institution TEXT,
  track TEXT DEFAULT 'Engineering & Science Track',
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'judge', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL DEFAULT 100,
  deadline TIMESTAMPTZ NOT NULL,
  allowed_formats TEXT[] NOT NULL,
  deliverables TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Tasks are viewable by everyone'
  ) THEN
    CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);
  END IF;
END $$;

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id INT REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'evaluated')),
  video_url TEXT,
  video_file_name TEXT,
  pptx_url TEXT,
  pptx_file_name TEXT,
  pptx_file_size BIGINT,
  github_url TEXT,
  github_branch TEXT DEFAULT 'main',
  notes TEXT,
  score NUMERIC DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, task_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Users can view their own submissions'
  ) THEN
    CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Users can insert their own submissions'
  ) THEN
    CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Users can update their own submissions'
  ) THEN
    CREATE POLICY "Users can update their own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Insert the 10 distinct competition tasks if they don't already exist
INSERT INTO public.tasks (id, title, short_title, category, description, points, deadline, allowed_formats, deliverables)
VALUES 
(
  1,
  'Research Formulation & Literature Review',
  'Problem & Lit Review',
  'Ideation & Research',
  'Define the technical challenge, conduct a comprehensive literature review, specify target benchmarks, and formulate your engineering hypothesis.',
  100,
  now() + interval '14 days',
  ARRAY['pptx', 'github', 'document'],
  ARRAY['Executive Abstract', 'Background & Related Works', 'Formulated Hypothesis', 'Initial Feasibility Study']
),
(
  2,
  'System Architecture & Engineering Schematics',
  'Architecture & Schematics',
  'Design & Architecture',
  'Develop end-to-end hardware-software system block diagrams, power distribution networks, circuit schematics, and pinout tables.',
  100,
  now() + interval '21 days',
  ARRAY['pptx', 'github', 'document'],
  ARRAY['System Block Diagrams', 'Component BOM (Bill of Materials)', 'Circuit Schematics (KiCad/Eagle)', 'Interface Protocols']
),
(
  3,
  '3D CAD Modeling & Structural Simulation',
  'CAD & Simulation',
  'Mechanical & Physical',
  'Design precision 3D CAD mechanical enclosures, structural chassis, aerodynamic/thermal simulations, and bill of materials.',
  100,
  now() + interval '28 days',
  ARRAY['pptx', 'video', 'github'],
  ARRAY['STEP / STL CAD Files', 'Stress & Thermal FEA Report', 'Exploded Assembly View', 'Rendered Turntable']
),
(
  4,
  'Embedded Firmware & Core Algorithm Monorepo',
  'Firmware & Core Algorithms',
  'Software Development',
  'Establish the official GitHub repository with clean firmware code, driver libraries, algorithmic logic, unit tests, and continuous integration pipeline.',
  100,
  now() + interval '35 days',
  ARRAY['github'],
  ARRAY['Clean GitHub Repository with README', 'Modular Source Code', 'Automated Unit Tests', 'Build & Flashing Guide']
),
(
  5,
  'Mid-Term Milestone Evaluation & Slide Deck',
  'Mid-Term Slide Deck',
  'Milestone Evaluation',
  'Present your 50% milestone progress, prototype status, test data, budget expenditure, and risk mitigation strategies in an executive PPTX presentation.',
  150,
  now() + interval '42 days',
  ARRAY['pptx', 'video'],
  ARRAY['Professional PPTX Deck (15-20 Slides)', 'Milestone Verification Matrix', 'Risk Management & Timeline Plan']
),
(
  6,
  'Live Prototype Demonstration & Telemetry Video',
  'Prototype Demo Video',
  'Demonstration',
  'Produce a crisp 3 to 5-minute video demonstrating live hardware in the loop, sensor calibration, wireless telemetry, and real-time execution.',
  150,
  now() + interval '49 days',
  ARRAY['video', 'github'],
  ARRAY['High-Resolution Demo Video (MP4/WebM)', 'Live Hardware Run', 'Sensor Telemetry Visualizer Link']
),
(
  7,
  'AI / ML Model Pipeline & Analytics Notebook',
  'AI/ML Data Pipeline',
  'Data Science & AI',
  'Deploy machine learning models or data processing algorithms. Include training logs, validation metrics, confusion matrices, and Jupyter/Colab notebooks.',
  100,
  now() + interval '56 days',
  ARRAY['github', 'pptx'],
  ARRAY['Jupyter Notebook / Python Pipeline', 'Model Weights & Checkpoints', 'Accuracy / F1 Performance Metrics']
),
(
  8,
  'Field Testing, Reliability & FMEA Report',
  'Stress Testing & FMEA',
  'Validation & Quality',
  'Conduct stress testing, extreme environment verification, Failure Mode and Effects Analysis (FMEA), and reliability optimization.',
  100,
  now() + interval '63 days',
  ARRAY['pptx', 'document', 'github'],
  ARRAY['FMEA Severity Matrix', 'Stress & Vibration Test Logs', 'Safety Protocol Verification']
),
(
  9,
  'Final Project Pitch Deck & Commercialization',
  'Final Pitch Deck',
  'Presentation & Business',
  'Craft an impactful executive slide deck detailing the final engineering solution, commercial viability, manufacturing cost analysis, and scalability.',
  150,
  now() + interval '70 days',
  ARRAY['pptx', 'video'],
  ARRAY['Executive Master Pitch Deck (PPTX)', 'Unit Economics & BOM Scaling', 'Market & Application Impact']
),
(
  10,
  'Grand Finale: Monorepo & Final Video Showcase',
  'Grand Finale Showcase',
  'Grand Finale',
  'Submit your comprehensive GitHub monorepo documentation alongside your flagship 4K/HD video presentation for final jury evaluation and awards.',
  200,
  now() + interval '77 days',
  ARRAY['video', 'pptx', 'github'],
  ARRAY['Complete GitHub Monorepo Tagged Release', 'Flagship 5-min 4K Video Showcase', 'Complete Archival Technical Manual']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  allowed_formats = EXCLUDED.allowed_formats,
  deliverables = EXCLUDED.deliverables;

-- Create Storage bucket for submissions if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('asl-submissions', 'asl-submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to Submissions'
  ) THEN
    CREATE POLICY "Public Access to Submissions" ON storage.objects FOR SELECT USING (bucket_id = 'asl-submissions');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload submissions'
  ) THEN
    CREATE POLICY "Authenticated users can upload submissions" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'asl-submissions' AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can update submissions'
  ) THEN
    CREATE POLICY "Authenticated users can update submissions" ON storage.objects FOR UPDATE USING (
      bucket_id = 'asl-submissions' AND auth.role() = 'authenticated'
    );
  END IF;
END $$;
`;

async function run() {
  console.log('Applying database schema to Supabase project:', projectRef);
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sqlScript })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to execute migration:', res.status, errorText);
    process.exit(1);
  }

  const result = await res.json();
  console.log('Migration successful! Result:', result);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
