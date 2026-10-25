import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { UserProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      department,
      batch,
      registrationNumber,
      email,
      password,
    } = body;

    // Validate required fields
    if (!name || !department || !batch || !registrationNumber || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required: Name, Department, Batch, Registration Number, Email Address, and Password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedDept = department.trim();
    const trimmedBatch = batch.trim();
    const trimmedRegNo = registrationNumber.trim().toUpperCase();

    // 1. Create or check user in Supabase Auth
    // Use admin API so email is pre-confirmed for seamless contest login
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        department: trimmedDept,
        batch: trimmedBatch,
        registration_number: trimmedRegNo,
      },
    });

    if (createErr) {
      // If user already exists in auth, check if they exist or return message
      if (createErr.message.includes('already registered') || createErr.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const userId = newUser.user.id;

    // 2. Upsert profile in public.profiles table
    const profilePayload = {
      id: userId,
      email: trimmedEmail,
      full_name: trimmedName,
      department: trimmedDept,
      batch: trimmedBatch,
      registration_number: trimmedRegNo,
      team_name: trimmedName, // Individual participant identifier
      institution: trimmedDept,
      track: `${trimmedDept} Track`,
      role: 'participant',
      updated_at: new Date().toISOString(),
    };

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload);

    if (profileErr) {
      console.error('[Register API] Error inserting profile:', profileErr);
    }

    const createdProfile: UserProfile = {
      id: userId,
      email: trimmedEmail,
      full_name: trimmedName,
      department: trimmedDept,
      batch: trimmedBatch,
      registration_number: trimmedRegNo,
      team_name: trimmedName,
      institution: trimmedDept,
      track: `${trimmedDept} Track`,
      role: 'participant',
    };

    // 3. Trigger Gmail Confirmation Email
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assignment-to-do.vercel.app';
    const emailResult = await sendRegistrationConfirmationEmail({
      email: trimmedEmail,
      name: trimmedName,
      department: trimmedDept,
      batch: trimmedBatch,
      registrationNumber: trimmedRegNo,
      password: password,
      portalUrl: portalUrl,
    });

    if (emailResult.success) {
      console.log(`[Register API] Confirmation email sent to ${trimmedEmail} successfully. ID: ${emailResult.messageId}`);
    } else {
      console.warn(`[Register API] Confirmation email to ${trimmedEmail} failed: ${emailResult.error}`);
    }

    return NextResponse.json({
      success: true,
      profile: createdProfile,
      emailSent: emailResult.success,
      emailSimulated: emailResult.simulated ?? false,
      emailError: emailResult.error ?? null,
      message: emailResult.success
        ? 'Registration successful! Confirmation email has been sent.'
        : 'Registration successful! (Note: Confirmation email delivery failed: ' + (emailResult.error || 'Check Gmail credentials') + ')',
    });
  } catch (error) {
    console.error('[Register API] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
