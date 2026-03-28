import { supabaseAdmin } from './connection.js';

export async function createContactRequest(data) {
  const { data: contact, error } = await supabaseAdmin
    .from('contact_requests')
    .insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      user_id: data.userId || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapContactFromDb(contact);
}

export async function getContactRequest(id) {
  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapContactFromDb(data);
}

export async function getAllContactRequests() {
  const { data, error } = await supabaseAdmin
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapContactFromDb);
}

export async function updateContactRequest(id, updates) {
  const dbUpdates = {};

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.adminReply !== undefined) dbUpdates.admin_reply = updates.adminReply;
  if (updates.repliedAt !== undefined) dbUpdates.replied_at = updates.repliedAt;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('contact_requests')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteContactRequest(id) {
  const { error } = await supabaseAdmin
    .from('contact_requests')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

function mapContactFromDb(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    userId: data.user_id,
    status: data.status,
    adminReply: data.admin_reply,
    repliedAt: data.replied_at,
    createdAt: data.created_at,
  };
}
