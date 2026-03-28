import { supabaseAdmin } from '../db/connection';

const RATE_LIMITS = {
  login: { max: 5, window: 15 * 60 * 1000 },
  register: { max: 3, window: 60 * 60 * 1000 },
  api: { max: 100, window: 60 * 1000 },
};

export async function checkRateLimit(identifier: string, endpoint: string): Promise<boolean> {
  const now = Date.now();
  
  await supabaseAdmin
    .from('rate_limits')
    .delete()
    .lt('reset_at', now);
  
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('count, reset_at')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .maybeSingle();
  
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;
  
  if (existing) {
    if (now > (existing as any).reset_at) {
      await supabaseAdmin
        .from('rate_limits')
        .delete()
        .eq('identifier', identifier)
        .eq('endpoint', endpoint);
      
      await supabaseAdmin
        .from('rate_limits')
        .insert([{
          id: `${identifier}_${endpoint}_${now}`,
          identifier,
          endpoint,
          count: 1,
          reset_at: now + limit.window,
        }] as any);
      
      return true;
    }
    
    if ((existing as any).count >= limit.max) {
      return false;
    }
    
    // @ts-expect-error - Supabase update with dynamic fields
    const updateQuery: any = supabaseAdmin.from('rate_limits').update({ count: (existing as any).count + 1 });
    await updateQuery.eq('identifier', identifier).eq('endpoint', endpoint);
    
    return true;
  }
  
  await supabaseAdmin
    .from('rate_limits')
    .insert([{
      id: `${identifier}_${endpoint}_${now}`,
      identifier,
      endpoint,
      count: 1,
      reset_at: now + limit.window,
    }] as any);
  
  return true;
}

export async function getRateLimitInfo(identifier: string, endpoint: string): Promise<{ remaining: number; resetAt: number } | null> {
  const now = Date.now();
  
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('count, reset_at')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .maybeSingle();
  
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;
  
  if (!existing || now > (existing as any).reset_at) {
    return { remaining: limit.max, resetAt: now + limit.window };
  }
  
  return {
    remaining: Math.max(0, limit.max - (existing as any).count),
    resetAt: (existing as any).reset_at,
  };
}
