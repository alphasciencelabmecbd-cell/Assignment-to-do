import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (taskId && taskId !== 'all') {
      query = query.eq('task_id', parseInt(taskId, 10));
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('[Admin Submissions GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch related profiles and tasks to enrich data
    const userIds = Array.from(new Set((submissions || []).map((s) => s.user_id)));
    const taskIds = Array.from(new Set((submissions || []).map((s) => s.task_id)));

    let profilesMap: Record<string, unknown> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profiles) {
        profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
      }
    }

    let tasksMap: Record<number, unknown> = {};
    if (taskIds.length > 0) {
      const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .in('id', taskIds);
      if (tasks) {
        tasksMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
      }
    }

    const enriched = (submissions || []).map((sub) => ({
      ...sub,
      profile: profilesMap[sub.user_id] || null,
      task: tasksMap[sub.task_id] || null,
    }));

    return NextResponse.json({ submissions: enriched });
  } catch (error) {
    console.error('[Admin Submissions GET] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error fetching submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, score, feedback, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (score !== undefined) updatePayload.score = score !== null ? Number(score) : null;
    if (feedback !== undefined) updatePayload.feedback = feedback;
    if (status) updatePayload.status = status;

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (error) {
    console.error('[Admin Submissions PATCH] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error updating submission' },
      { status: 500 }
    );
  }
}
