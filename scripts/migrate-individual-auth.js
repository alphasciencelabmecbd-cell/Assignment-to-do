const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.SUPABASE_PROJECT_REF || 'epqwjnsauwrjlvplkjoa';

if (!token) {
  console.warn('Warning: SUPABASE_ACCESS_TOKEN not set. Set it before running this script.');
}

const sql = `
-- Add individual registration fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'suspended'));

-- Drop or alter constraints if any
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Admins can view all submissions'
  ) THEN
    CREATE POLICY "Admins can view all submissions" ON public.submissions FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Admins can update all submissions'
  ) THEN
    CREATE POLICY "Admins can update all submissions" ON public.submissions FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Admins can insert tasks'
  ) THEN
    CREATE POLICY "Admins can insert tasks" ON public.tasks FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Admins can update tasks'
  ) THEN
    CREATE POLICY "Admins can update tasks" ON public.tasks FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Admins can delete tasks'
  ) THEN
    CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects are viewable by everyone'
  ) THEN
    CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Admins can manage projects'
  ) THEN
    CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'judge'))
    );
  END IF;
END $$;
`;

async function main() {
  console.log('Applying DB migration to project:', projectRef);
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  console.log('Result:', data);
}

main().catch(console.error);
