import { supabaseAdmin } from './connection.js';

export async function getAdminSettings() {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching admin settings:', error);
  }

  return {
    freeStoryLimit: data?.free_story_limit || 3,
    enableRegistration: data?.enable_registration ?? true,
    maintenanceMode: data?.maintenance_mode ?? false,
    premiumPrice: data?.premium_price || 9.99,
  };
}

export async function updateAdminSettings(updates) {
  const dbUpdates = {};

  if (updates.freeStoryLimit !== undefined) dbUpdates.free_story_limit = updates.freeStoryLimit;
  if (updates.enableRegistration !== undefined) dbUpdates.enable_registration = updates.enableRegistration;
  if (updates.maintenanceMode !== undefined) dbUpdates.maintenance_mode = updates.maintenanceMode;
  if (updates.premiumPrice !== undefined) dbUpdates.premium_price = updates.premiumPrice;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { data: existing } = await supabaseAdmin
    .from('admin_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('admin_settings')
      .update(dbUpdates)
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('admin_settings')
      .insert(dbUpdates);
  }
}

export async function getApiKeys() {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching API keys:', error);
  }

  return {
    openaiKey: data?.openai_key || '',
    geminiKey: data?.gemini_key || '',
    stripeSecretKey: data?.stripe_secret_key || '',
    stripePublishableKey: data?.stripe_publishable_key || '',
    googleOAuthWebClientId: data?.google_oauth_web_client_id || '',
    googleOAuthIosClientId: data?.google_oauth_ios_client_id || '',
    googleOAuthAndroidClientId: data?.google_oauth_android_client_id || '',
  };
}

export async function updateApiKeys(updates) {
  const dbUpdates = {};

  if (updates.openaiKey !== undefined) dbUpdates.openai_key = updates.openaiKey;
  if (updates.geminiKey !== undefined) dbUpdates.gemini_key = updates.geminiKey;
  if (updates.stripeSecretKey !== undefined) dbUpdates.stripe_secret_key = updates.stripeSecretKey;
  if (updates.stripePublishableKey !== undefined) dbUpdates.stripe_publishable_key = updates.stripePublishableKey;
  if (updates.googleOAuthWebClientId !== undefined) dbUpdates.google_oauth_web_client_id = updates.googleOAuthWebClientId;
  if (updates.googleOAuthIosClientId !== undefined) dbUpdates.google_oauth_ios_client_id = updates.googleOAuthIosClientId;
  if (updates.googleOAuthAndroidClientId !== undefined) dbUpdates.google_oauth_android_client_id = updates.googleOAuthAndroidClientId;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { data: existing } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('api_keys')
      .update(dbUpdates)
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('api_keys')
      .insert(dbUpdates);
  }
}

export async function addActivityLog(action, userId, description) {
  await supabaseAdmin
    .from('activity_logs')
    .insert({
      action,
      user_id: userId,
      description,
    });
}

export async function getActivityLogs(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((log) => ({
    id: log.id,
    action: log.action,
    userId: log.user_id,
    description: log.description,
    createdAt: log.created_at,
  }));
}
