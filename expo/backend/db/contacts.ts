import { supabaseAdmin } from './connection';

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
  userId?: string;
};

export async function createContactRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}): Promise<ContactRequest> {
  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .insert([{
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      status: 'pending' as const,
      user_id: input.userId || null,
    }] as any)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create contact request');
  }

  return {
    id: (data as any).id,
    name: (data as any).name,
    email: (data as any).email,
    subject: (data as any).subject,
    message: (data as any).message,
    status: (data as any).status,
    createdAt: (data as any).created_at,
    repliedAt: (data as any).replied_at || undefined,
    adminReply: (data as any).admin_reply || undefined,
    userId: (data as any).user_id || undefined,
  };
}

export async function getAllContactRequests(): Promise<ContactRequest[]> {
  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    repliedAt: row.replied_at || undefined,
    adminReply: row.admin_reply || undefined,
    userId: row.user_id || undefined,
  }));
}

export async function getContactRequest(id: string): Promise<ContactRequest | undefined> {
  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    id: (data as any).id,
    name: (data as any).name,
    email: (data as any).email,
    subject: (data as any).subject,
    message: (data as any).message,
    status: (data as any).status,
    createdAt: (data as any).created_at,
    repliedAt: (data as any).replied_at || undefined,
    adminReply: (data as any).admin_reply || undefined,
    userId: (data as any).user_id || undefined,
  };
}

export async function updateContactRequest(id: string, updates: Partial<ContactRequest>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.repliedAt !== undefined) dbUpdates.replied_at = updates.repliedAt;
  if (updates.adminReply !== undefined) dbUpdates.admin_reply = updates.adminReply;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  // @ts-expect-error - Supabase update with dynamic fields
  const updateQuery: any = supabaseAdmin.from('contact_requests').update(dbUpdates);
  await updateQuery.eq('id', id);
}

export async function deleteContactRequest(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('contact_requests')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
