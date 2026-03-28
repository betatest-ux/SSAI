import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './connection';

export type User = {
  id: string;
  email: string;
  password?: string;
  name: string;
  isPremium: boolean;
  storiesGenerated: number;
  isAdmin: boolean;
  createdAt: string;
  subscriptionEndDate?: string;
  lastLoginAt?: string;
  stripeCustomerId?: string;
};

export async function getUserData(emailOrId: string): Promise<User | undefined> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .or(`email.eq.${emailOrId},id.eq.${emailOrId}`)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    id: (data as any).id,
    email: (data as any).email,
    name: (data as any).name,
    isPremium: (data as any).is_premium,
    storiesGenerated: (data as any).stories_generated,
    isAdmin: (data as any).is_admin,
    createdAt: (data as any).created_at,
    subscriptionEndDate: (data as any).subscription_end_date || undefined,
    lastLoginAt: (data as any).last_login_at || undefined,
    stripeCustomerId: (data as any).stripe_customer_id || undefined,
  };
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name,
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create auth user');
  }

  const updateData: any = {
    name: input.name,
  };

  // @ts-expect-error - Supabase update with dynamic fields
  const updateQuery: any = supabaseAdmin.from('users').update(updateData);
  await updateQuery.eq('id', authData.user.id).select().maybeSingle();

  const user = await getUserData(authData.user.id);
  if (!user) {
    throw new Error('Failed to create user profile');
  }

  return user;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
  if (updates.storiesGenerated !== undefined) dbUpdates.stories_generated = updates.storiesGenerated;
  if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;
  if (updates.subscriptionEndDate !== undefined) dbUpdates.subscription_end_date = updates.subscriptionEndDate;
  if (updates.lastLoginAt !== undefined) dbUpdates.last_login_at = updates.lastLoginAt;
  if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  // @ts-expect-error - Supabase update with dynamic fields
  const updateQuery: any = supabaseAdmin.from('users').update(dbUpdates);
  await updateQuery.eq('id', userId);
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    isPremium: row.is_premium,
    storiesGenerated: row.stories_generated,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    subscriptionEndDate: row.subscription_end_date || undefined,
    lastLoginAt: row.last_login_at || undefined,
    stripeCustomerId: row.stripe_customer_id || undefined,
  }));
}

export async function deleteUser(userId: string): Promise<void> {
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (authError) {
    console.error('Failed to delete auth user:', authError);
  }
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function initializeDefaultAdmin() {
  const existingAdmin = await getUserData('admin@socialstoryai.com');

  if (!existingAdmin) {
    console.log('⚠️ Please create admin user manually in Supabase:');
    console.log('1. Go to Authentication > Users in Supabase Dashboard');
    console.log('2. Create user with email: admin@socialstoryai.com');
    console.log('3. Run: UPDATE public.users SET is_admin = true, is_premium = true WHERE email = \'admin@socialstoryai.com\';');
  }
}
