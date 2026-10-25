import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('competition_settings')
      .select('*');

    if (error) {
      console.warn('[Settings API] Warning fetching settings:', error.message);
      // Fallback default master deadline (14 days from now)
      return NextResponse.json({
        settings: {
          master_deadline: '2026-11-15T23:59:59.000Z',
        },
      });
    }

    const settingsMap: Record<string, string> = {};
    (data || []).forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    if (!settingsMap.master_deadline) {
      settingsMap.master_deadline = '2026-11-15T23:59:59.000Z';
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('[Settings API] Exception:', error);
    return NextResponse.json({
      settings: {
        master_deadline: '2026-11-15T23:59:59.000Z',
      },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { master_deadline, ...rest } = body;

    const updates: { key: string; value: string; updated_at: string }[] = [];

    if (master_deadline) {
      updates.push({
        key: 'master_deadline',
        value: new Date(master_deadline).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === 'string') {
        updates.push({
          key,
          value,
          updated_at: new Date().toISOString(),
        });
      }
    });

    if (updates.length > 0) {
      const { error } = await supabaseAdmin
        .from('competition_settings')
        .upsert(updates);

      if (error) {
        console.error('[Settings API PATCH] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Return the updated settings map
    const { data: refreshed } = await supabaseAdmin
      .from('competition_settings')
      .select('*');

    const settingsMap: Record<string, string> = {};
    (refreshed || []).forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      message: 'Master competition settings updated successfully.',
    });
  } catch (error) {
    console.error('[Settings API PATCH] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating settings' },
      { status: 500 }
    );
  }
}
