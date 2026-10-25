import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      task_id,
      user_id,
      github_url,
      github_branch,
      video_url,
      document_url,
      image_url,
      pptx_url,
      notes,
      team_name,
      status = 'submitted',
    } = body;

    if (!task_id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required. Please sign in to submit.' }, { status: 401 });
    }

    // Verify task exists and check allowed formats
    const { data: task, error: taskErr } = await supabaseAdmin
      .from('tasks')
      .select('id, title, points, allowed_formats')
      .eq('id', parseInt(task_id, 10))
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Specified task does not exist in the database' }, { status: 404 });
    }

    const allowed = (task.allowed_formats || ['github']) as string[];

    // Validate GitHub repository link if provided
    if (github_url) {
      const trimmedGit = github_url.trim();
      const isValidGit = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(trimmedGit);
      if (!isValidGit) {
        return NextResponse.json(
          { error: 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)' },
          { status: 400 }
        );
      }
    }

    // Ensure at least one required enabled deliverable is provided
    const doc = document_url || pptx_url;
    const hasAnyDeliverable =
      (allowed.includes('github') && Boolean(github_url?.trim())) ||
      (allowed.includes('video') && Boolean(video_url?.trim())) ||
      (allowed.includes('document') && Boolean(doc?.trim())) ||
      (allowed.includes('pptx') && Boolean(doc?.trim())) ||
      (allowed.includes('image') && Boolean(image_url?.trim()));

    if (status === 'submitted' && !hasAnyDeliverable) {
      const reqList = allowed.map((f: string) => {
        if (f === 'github') return 'GitHub Repository';
        if (f === 'video') return 'YouTube / Video Link';
        if (f === 'document' || f === 'pptx') return 'Google Drive / Document Link';
        if (f === 'image') return 'Direct Image Deliverable';
        return f;
      }).join(', ');
      return NextResponse.json(
        { error: `Please provide at least one required deliverable for this task (${reqList}).` },
        { status: 400 }
      );
    }

    // Fetch user profile for team/participant name
    let participantName = team_name;
    if (!participantName) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', user_id)
        .single();
      participantName = profile?.full_name || 'Individual Participant';
    }

    // Check if an existing submission exists for this user and task
    const { data: existingSub } = await supabaseAdmin
      .from('submissions')
      .select('id, score, feedback, submitted_at')
      .eq('user_id', user_id)
      .eq('task_id', parseInt(task_id, 10))
      .maybeSingle();

    const now = new Date().toISOString();
    const submissionPayload = {
      id: existingSub?.id || crypto.randomUUID(),
      user_id,
      task_id: parseInt(task_id, 10),
      team_name: participantName,
      status,
      github_url: github_url ? github_url.trim() : null,
      github_branch: github_branch ? github_branch.trim() : 'main',
      video_url: video_url ? video_url.trim() : null,
      document_url: doc ? doc.trim() : null,
      pptx_url: doc ? doc.trim() : null,
      image_url: image_url ? image_url.trim() : null,
      notes: notes ? notes.trim() : null,
      submitted_at: existingSub?.submitted_at || now,
      updated_at: now,
    };

    const { data: savedSubmission, error: saveErr } = await supabaseAdmin
      .from('submissions')
      .upsert(submissionPayload)
      .select()
      .single();

    if (saveErr) {
      console.error('[Submissions API] Error saving submission:', saveErr);
      return NextResponse.json({ error: saveErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      submission: savedSubmission,
      message: 'Submission validated and saved successfully!',
    });
  } catch (error) {
    console.error('[Submissions API] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error processing submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('taskId');

    let query = supabaseAdmin.from('submissions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (taskId) {
      query = query.eq('task_id', parseInt(taskId, 10));
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching submissions' },
      { status: 500 }
    );
  }
}
