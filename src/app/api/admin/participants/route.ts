import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { UserProfile } from '@/types';

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch auth users to get actual live auth metadata, verification & sign-in status
    const authUsersMap = new Map<string, { email_confirmed_at: string | null; last_sign_in_at: string | null; banned_until: string | null }>();
    try {
      const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (authUsersData?.users) {
        authUsersData.users.forEach((u) => {
          authUsersMap.set(u.id, {
            email_confirmed_at: u.email_confirmed_at || null,
            last_sign_in_at: u.last_sign_in_at || null,
            banned_until: (u as { banned_until?: string | null }).banned_until || null,
          });
        });
      }
    } catch (authListErr) {
      console.warn('[Admin API] Could not list auth users:', authListErr);
    }

    // Get submission statistics for each participant
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('user_id, status, score');

    const userStats: Record<string, { totalSubmissions: number; evaluatedCount: number; totalScore: number }> = {};
    (submissions || []).forEach((sub) => {
      if (!userStats[sub.user_id]) {
        userStats[sub.user_id] = { totalSubmissions: 0, evaluatedCount: 0, totalScore: 0 };
      }
      userStats[sub.user_id].totalSubmissions += 1;
      if (sub.status === 'evaluated' && sub.score !== null) {
        userStats[sub.user_id].evaluatedCount += 1;
        userStats[sub.user_id].totalScore += Number(sub.score);
      }
    });

    const enrichedProfiles: UserProfile[] = (profiles || []).map((p) => {
      const stats = userStats[p.id] || { totalSubmissions: 0, evaluatedCount: 0, totalScore: 0 };
      const authInfo = authUsersMap.get(p.id);

      // Determine verified & account status
      const isVerified = p.is_verified ?? (!!authInfo?.email_confirmed_at || p.role === 'admin');
      const isSuspended = authInfo?.banned_until ? new Date(authInfo.banned_until) > new Date() : false;
      const accountStatus = isSuspended ? 'suspended' : (p.account_status || 'active');

      return {
        ...p,
        is_verified: isVerified,
        account_status: accountStatus,
        email_confirmed_at: authInfo?.email_confirmed_at || null,
        last_sign_in_at: authInfo?.last_sign_in_at || null,
        submissions_count: stats.totalSubmissions,
        evaluated_count: stats.evaluatedCount,
        total_score: stats.totalScore,
      };
    });

    return NextResponse.json({ participants: enrichedProfiles });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      password,
      department,
      batch,
      registration_number,
      role = 'participant',
      is_verified = true,
      account_status = 'active',
      send_email = false,
    } = body;

    // Validate essential fields
    if (!email || !full_name || !department || !batch || !registration_number) {
      return NextResponse.json(
        { error: 'Full name, email, department, batch, and registration number are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = full_name.trim();
    const trimmedDept = department.trim();
    const trimmedBatch = batch.trim();
    const trimmedRegNo = registration_number.trim().toUpperCase();

    // Generate a secure temporary password if none provided
    const userPassword = password && password.trim().length >= 6
      ? password.trim()
      : `ASL@${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Create User in Supabase Auth via Admin API
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: userPassword,
      email_confirm: Boolean(is_verified),
      user_metadata: {
        full_name: trimmedName,
        department: trimmedDept,
        batch: trimmedBatch,
        registration_number: trimmedRegNo,
        role: role,
        is_verified: Boolean(is_verified),
        account_status: account_status,
      },
      app_metadata: {
        role: role,
        is_verified: Boolean(is_verified),
        account_status: account_status,
      },
    });

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. If account status is suspended from the start, apply ban
    if (account_status === 'suspended') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      });
    }

    // 3. Insert or upsert into public.profiles
    const profilePayload = {
      id: userId,
      email: trimmedEmail,
      full_name: trimmedName,
      department: trimmedDept,
      batch: trimmedBatch,
      registration_number: trimmedRegNo,
      team_name: trimmedName,
      institution: trimmedDept,
      track: `${trimmedDept} Track`,
      role: role,
      is_verified: Boolean(is_verified),
      account_status: account_status,
      updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .single();

    if (profileErr) {
      console.error('[Admin API] Error inserting profile for created user:', profileErr);
    }

    // 4. Optionally send registration email with credentials
    let emailSent = false;
    let emailError: string | null = null;
    if (send_email) {
      const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assignment-to-do.vercel.app';
      const emailResult = await sendRegistrationConfirmationEmail({
        email: trimmedEmail,
        name: trimmedName,
        department: trimmedDept,
        batch: trimmedBatch,
        registrationNumber: trimmedRegNo,
        password: userPassword,
        portalUrl: portalUrl,
      });
      emailSent = emailResult.success;
      emailError = emailResult.error || null;
    }

    const createdParticipant: UserProfile = {
      id: userId,
      email: trimmedEmail,
      full_name: trimmedName,
      department: trimmedDept,
      batch: trimmedBatch,
      registration_number: trimmedRegNo,
      team_name: trimmedName,
      institution: trimmedDept,
      track: `${trimmedDept} Track`,
      role: role,
      is_verified: Boolean(is_verified),
      account_status: account_status,
      submissions_count: 0,
      evaluated_count: 0,
      total_score: 0,
      created_at: newProfile?.created_at || new Date().toISOString(),
      updated_at: newProfile?.updated_at || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      participant: createdParticipant,
      generatedPassword: password ? undefined : userPassword,
      emailSent,
      emailError,
      message: `Participant "${trimmedName}" created and synced with database successfully!`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating participant' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      full_name,
      department,
      batch,
      registration_number,
      role,
      email,
      password,
      is_verified,
      account_status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    // 1. Prepare profile updates
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) {
      updatePayload.full_name = full_name.trim();
      updatePayload.team_name = full_name.trim();
    }
    if (department !== undefined) {
      updatePayload.department = department.trim();
      updatePayload.institution = department.trim();
    }
    if (batch !== undefined) updatePayload.batch = batch.trim();
    if (registration_number !== undefined) updatePayload.registration_number = registration_number.trim().toUpperCase();
    if (role !== undefined) updatePayload.role = role;
    if (email !== undefined) updatePayload.email = email.trim().toLowerCase();
    if (is_verified !== undefined) updatePayload.is_verified = Boolean(is_verified);
    if (account_status !== undefined) updatePayload.account_status = account_status;

    // 2. Update Supabase public.profiles table
    const { data: updatedProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 3. Immediately synchronize updates to participant's actual Supabase Auth account status
    const authAttributes: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
      ban_duration?: string;
    } = {};

    if (email !== undefined) {
      authAttributes.email = email.trim().toLowerCase();
      authAttributes.email_confirm = true;
    }
    if (password && password.trim().length >= 6) {
      authAttributes.password = password.trim();
    }
    if (is_verified === true) {
      authAttributes.email_confirm = true;
    }

    // Sync metadata
    authAttributes.user_metadata = {
      ...(full_name !== undefined ? { full_name: full_name.trim() } : {}),
      ...(department !== undefined ? { department: department.trim() } : {}),
      ...(batch !== undefined ? { batch: batch.trim() } : {}),
      ...(registration_number !== undefined ? { registration_number: registration_number.trim().toUpperCase() } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(is_verified !== undefined ? { is_verified: Boolean(is_verified) } : {}),
      ...(account_status !== undefined ? { account_status } : {}),
    };

    authAttributes.app_metadata = {
      ...(role !== undefined ? { role } : {}),
      ...(is_verified !== undefined ? { is_verified: Boolean(is_verified) } : {}),
      ...(account_status !== undefined ? { account_status } : {}),
    };

    // Apply ban or unban for account status
    if (account_status === 'suspended') {
      authAttributes.ban_duration = '876000h'; // 100 years ban
    } else if (account_status === 'active') {
      authAttributes.ban_duration = 'none'; // Unban immediately
    }

    try {
      const { error: authUpdateErr } = await supabaseAdmin.auth.admin.updateUserById(id, authAttributes);
      if (authUpdateErr) {
        console.warn(`[Admin API] Notice: auth.admin.updateUserById warning for ${id}:`, authUpdateErr.message);
      }
    } catch (authErr) {
      console.warn(`[Admin API] Notice: Exception updating auth user ${id}:`, authErr);
    }

    return NextResponse.json({
      success: true,
      participant: updatedProfile,
      message: 'Participant data and account status synchronized successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    // Also support JSON body if ID is passed in body
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body not present, query param only
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    // 1. Delete user's submissions first to guarantee no foreign key lock
    await supabaseAdmin
      .from('submissions')
      .delete()
      .eq('user_id', id);

    // 2. Delete user from Supabase Auth (this permanently destroys session & credentials)
    let authDeleted = false;
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (!authErr) {
      authDeleted = true;
    } else {
      console.warn(`[Admin API] Auth delete user notice for ${id}:`, authErr.message);
    }

    // 3. Delete from public.profiles table
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    return NextResponse.json({
      success: true,
      authDeleted,
      message: 'Participant permanently deleted from database and authentication accounts.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error removing participant' },
      { status: 500 }
    );
  }
}
