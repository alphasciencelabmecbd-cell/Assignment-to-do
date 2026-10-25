import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LeaderboardEntry } from '@/types';

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export async function GET() {
  try {
    // 1. Fetch all participants from profiles
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, department, batch, registration_number, role, team_name, institution, track')
      .neq('role', 'admin') // Exclude competition admins from competitor rankings
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.error('[Leaderboard API] Profile fetch error:', profileErr);
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 2. Fetch all submissions
    const { data: submissions, error: subErr } = await supabaseAdmin
      .from('submissions')
      .select('user_id, task_id, status, score, submitted_at, updated_at');

    if (subErr) {
      console.error('[Leaderboard API] Submissions fetch error:', subErr);
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    // 3. Aggregate metrics per participant
    const userAggregates: Record<
      string,
      {
        totalScore: number;
        completedTasks: Set<number>;
        latestDate: string | null;
      }
    > = {};

    (submissions || []).forEach((sub) => {
      if (!userAggregates[sub.user_id]) {
        userAggregates[sub.user_id] = {
          totalScore: 0,
          completedTasks: new Set(),
          latestDate: null,
        };
      }

      const agg = userAggregates[sub.user_id];

      // Add points if evaluated with a score
      if (sub.score !== null && sub.score !== undefined) {
        agg.totalScore += Number(sub.score);
      }

      // Count completed tasks (submitted or evaluated)
      if (sub.status === 'submitted' || sub.status === 'evaluated') {
        agg.completedTasks.add(sub.task_id);
      }

      // Track latest submission time
      const subTime = sub.updated_at || sub.submitted_at;
      if (subTime) {
        if (!agg.latestDate || new Date(subTime) > new Date(agg.latestDate)) {
          agg.latestDate = subTime;
        }
      }
    });

    // 4. Map profiles into LeaderboardEntry candidates
    const entries = (profiles || []).map((p) => {
      const agg = userAggregates[p.id] || {
        totalScore: 0,
        completedTasks: new Set(),
        latestDate: null,
      };

      return {
        name: p.full_name || p.email || 'Anonymous Competitor',
        registration_number: p.registration_number || 'REG-PENDING',
        department: p.department || 'Engineering',
        batch: p.batch || 'Batch 2024',
        team_name: p.team_name || undefined,
        institution: p.institution || undefined,
        track: p.track || undefined,
        tasks_completed: agg.completedTasks.size,
        total_score: agg.totalScore,
        last_submission_time: formatRelativeTime(agg.latestDate),
        raw_last_time: agg.latestDate ? new Date(agg.latestDate).getTime() : 0,
      };
    });

    // 5. Sort descending by total cumulative scores across all completed technical tasks
    entries.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      if (b.tasks_completed !== a.tasks_completed) {
        return b.tasks_completed - a.tasks_completed;
      }
      return b.raw_last_time - a.raw_last_time;
    });

    // 6. Assign official real-time rank numbers
    const leaderboard: LeaderboardEntry[] = entries.map((entry, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { raw_last_time, ...rest } = entry;
      return {
        ...rest,
        rank: index + 1,
      };
    });

    return NextResponse.json({
      leaderboard,
      stats: {
        totalParticipants: profiles?.length || 0,
        totalSubmissions: submissions?.length || 0,
        topScore: leaderboard.length > 0 ? leaderboard[0].total_score : 0,
      },
    });
  } catch (error) {
    console.error('[Leaderboard API] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching leaderboard' },
      { status: 500 }
    );
  }
}
