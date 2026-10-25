import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[Admin Tasks GET Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get submission count and statistics per task
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('task_id, status, score');

    const statsMap: Record<number, { total: number; evaluated: number; avgScore: number }> = {};
    (submissions || []).forEach((sub) => {
      if (!statsMap[sub.task_id]) {
        statsMap[sub.task_id] = { total: 0, evaluated: 0, avgScore: 0 };
      }
      statsMap[sub.task_id].total += 1;
      if (sub.status === 'evaluated' && sub.score !== null) {
        statsMap[sub.task_id].evaluated += 1;
        statsMap[sub.task_id].avgScore += Number(sub.score);
      }
    });

    const tasksWithStats = (tasks || []).map((t) => {
      const stat = statsMap[t.id] || { total: 0, evaluated: 0, avgScore: 0 };
      return {
        ...t,
        submissionCount: stat.total,
        evaluatedCount: stat.evaluated,
        avgScore: stat.evaluated > 0 ? Math.round(stat.avgScore / stat.evaluated) : null,
      };
    });

    return NextResponse.json({ tasks: tasksWithStats });
  } catch (error) {
    console.error('[Admin Tasks GET Exception]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      short_title,
      category,
      description,
      points,
      deadline,
      allowed_formats,
      deliverables,
      youtube_url,
      resources,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, category, and description are required' }, { status: 400 });
    }

    // Determine ID: Admin can specify custom task number, or it auto-increments
    let taskId = id ? parseInt(id, 10) : null;
    if (!taskId || isNaN(taskId)) {
      const { data: maxTask } = await supabaseAdmin
        .from('tasks')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      taskId = maxTask?.id ? maxTask.id + 1 : 1;
    }

    const newTask = {
      id: taskId,
      title: title.trim(),
      short_title: (short_title || title).trim(),
      category: category.trim(),
      description: description.trim(),
      points: points ? parseInt(points, 10) : 100,
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
      allowed_formats: allowed_formats && allowed_formats.length > 0 ? allowed_formats : ['github'],
      deliverables: deliverables && deliverables.length > 0 ? deliverables : ['Clean GitHub Repository Link', 'Technical Documentation'],
      youtube_url: youtube_url ? youtube_url.trim() : null,
      resources: Array.isArray(resources) ? resources : [],
    };

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .upsert(newTask)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating/updating task' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      short_title,
      category,
      description,
      points,
      deadline,
      allowed_formats,
      deliverables,
      youtube_url,
      resources,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required for editing' }, { status: 400 });
    }

    const taskId = parseInt(id, 10);
    const updatePayload: Record<string, unknown> = {};

    if (title !== undefined) updatePayload.title = title.trim();
    if (short_title !== undefined) updatePayload.short_title = short_title.trim();
    if (category !== undefined) updatePayload.category = category.trim();
    if (description !== undefined) updatePayload.description = description.trim();
    if (points !== undefined) updatePayload.points = parseInt(points, 10);
    if (deadline !== undefined) updatePayload.deadline = new Date(deadline).toISOString();
    if (allowed_formats !== undefined) updatePayload.allowed_formats = allowed_formats;
    if (deliverables !== undefined) updatePayload.deliverables = deliverables;
    if (youtube_url !== undefined) updatePayload.youtube_url = youtube_url ? youtube_url.trim() : null;
    if (resources !== undefined) updatePayload.resources = resources;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const taskId = parseInt(id, 10);

    // Also delete any existing submissions for this task
    await supabaseAdmin
      .from('submissions')
      .delete()
      .eq('task_id', taskId);

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Task ${id} and associated submissions deleted successfully` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting task' },
      { status: 500 }
    );
  }
}
