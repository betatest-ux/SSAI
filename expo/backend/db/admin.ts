import { supabaseAdmin } from './connection';
import type { Database } from '@/lib/supabase';

export type ApiKeys = {
  id: string;
  openaiKey?: string;
  geminiKey?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  googleOAuthWebClientId?: string;
  googleOAuthIosClientId?: string;
  googleOAuthAndroidClientId?: string;
  mailHost?: string;
  mailPort?: number;
  mailUser?: string;
  mailPassword?: string;
  mailFrom?: string;
  jwtSecret?: string;
  updatedAt: string;
};

export type AdminSettings = {
  id: string;
  freeStoryLimit: number;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  premiumPrice: number;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  details: string;
};

export async function getApiKeys(): Promise<ApiKeys> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('id', 'default')
    .maybeSingle() as { data: any };

  if (!data) {
    const now = new Date().toISOString();
    const { data: newData, error: insertError } = await supabaseAdmin
      .from('api_keys')
      .insert([{ id: 'default' }] as any)
      .select()
      .single();

    if (insertError || !newData) {
      throw new Error('Failed to create default API keys');
    }

    return {
      id: 'default',
      updatedAt: now,
    };
  }

  return {
    id: data.id as string,
    openaiKey: (data.openai_key as string | null) || undefined,
    geminiKey: (data.gemini_key as string | null) || undefined,
    stripeSecretKey: (data.stripe_secret_key as string | null) || undefined,
    stripePublishableKey: (data.stripe_publishable_key as string | null) || undefined,
    googleOAuthWebClientId: (data.google_oauth_web_client_id as string | null) || undefined,
    googleOAuthIosClientId: (data.google_oauth_ios_client_id as string | null) || undefined,
    googleOAuthAndroidClientId: (data.google_oauth_android_client_id as string | null) || undefined,
    mailHost: (data.mail_host as string | null) || undefined,
    mailPort: (data.mail_port as number | null) || undefined,
    mailUser: (data.mail_user as string | null) || undefined,
    mailPassword: (data.mail_password as string | null) || undefined,
    mailFrom: (data.mail_from as string | null) || undefined,
    jwtSecret: (data.jwt_secret as string | null) || undefined,
    updatedAt: data.updated_at as string,
  };
}

export async function updateApiKeys(updates: Partial<ApiKeys>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.openaiKey !== undefined) dbUpdates.openai_key = updates.openaiKey;
  if (updates.geminiKey !== undefined) dbUpdates.gemini_key = updates.geminiKey;
  if (updates.stripeSecretKey !== undefined) dbUpdates.stripe_secret_key = updates.stripeSecretKey;
  if (updates.stripePublishableKey !== undefined) dbUpdates.stripe_publishable_key = updates.stripePublishableKey;
  if (updates.googleOAuthWebClientId !== undefined) dbUpdates.google_oauth_web_client_id = updates.googleOAuthWebClientId;
  if (updates.googleOAuthIosClientId !== undefined) dbUpdates.google_oauth_ios_client_id = updates.googleOAuthIosClientId;
  if (updates.googleOAuthAndroidClientId !== undefined) dbUpdates.google_oauth_android_client_id = updates.googleOAuthAndroidClientId;
  if (updates.mailHost !== undefined) dbUpdates.mail_host = updates.mailHost;
  if (updates.mailPort !== undefined) dbUpdates.mail_port = updates.mailPort;
  if (updates.mailUser !== undefined) dbUpdates.mail_user = updates.mailUser;
  if (updates.mailPassword !== undefined) dbUpdates.mail_password = updates.mailPassword;
  if (updates.mailFrom !== undefined) dbUpdates.mail_from = updates.mailFrom;
  if (updates.jwtSecret !== undefined) dbUpdates.jwt_secret = updates.jwtSecret;

  if (Object.keys(dbUpdates).length > 0) {
    // @ts-expect-error - Supabase update with dynamic fields
    const updateQuery: any = supabaseAdmin.from('api_keys').update(dbUpdates);
    await updateQuery.eq('id', 'default');
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('*')
    .eq('id', 'default')
    .single<Database['public']['Tables']['admin_settings']['Row']>();

  if (error || !data) {
    throw new Error('Admin settings not found');
  }

  return {
    id: data.id,
    freeStoryLimit: data.free_story_limit,
    enableRegistration: data.enable_registration,
    maintenanceMode: data.maintenance_mode,
    premiumPrice: Number(data.premium_price),
    updatedAt: data.updated_at,
  };
}

export async function updateAdminSettings(updates: Partial<AdminSettings>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.freeStoryLimit !== undefined) dbUpdates.free_story_limit = updates.freeStoryLimit;
  if (updates.enableRegistration !== undefined) dbUpdates.enable_registration = updates.enableRegistration;
  if (updates.maintenanceMode !== undefined) dbUpdates.maintenance_mode = updates.maintenanceMode;
  if (updates.premiumPrice !== undefined) dbUpdates.premium_price = updates.premiumPrice;

  if (Object.keys(dbUpdates).length > 0) {
    // @ts-expect-error - Supabase update with dynamic fields
    const updateQuery: any = supabaseAdmin.from('admin_settings').update(dbUpdates);
    await updateQuery.eq('id', 'default');
  }
}

export async function addActivityLog(action: string, userId: string, details: string): Promise<void> {
  await supabaseAdmin
    .from('activity_logs')
    .insert([{
      timestamp: Date.now(),
      action,
      user_id: userId,
      details,
    }] as any);

  const { data: countData } = await supabaseAdmin
    .from('activity_logs')
    .select('id', { count: 'exact', head: true });

  const count = countData?.length || 0;

  if (count > 100) {
    const { data: oldLogs } = await supabaseAdmin
      .from('activity_logs')
      .select('id')
      .order('timestamp', { ascending: true })
      .limit(count - 100);

    if (oldLogs && oldLogs.length > 0) {
      const idsToDelete = oldLogs.map((log: any) => log.id);
      await supabaseAdmin
        .from('activity_logs')
        .delete()
        .in('id', idsToDelete);
    }
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    userId: row.user_id,
    details: row.details,
  }));
}
