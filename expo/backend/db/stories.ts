import { supabaseAdmin } from './connection';

export type Story = {
  id: string;
  userId: string;
  childName: string;
  situation: string;
  complexity: string;
  tone: string;
  imageStyle: string;
  content: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export async function createStory(input: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .insert([{
      user_id: input.userId,
      child_name: input.childName,
      situation: input.situation,
      complexity: input.complexity,
      tone: input.tone,
      image_style: input.imageStyle,
      content: input.content,
      images: input.images as any,
      video_url: input.videoUrl || null,
    }] as any)
    .select()
    .single() as { data: any; error: any };

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create story');
  }

  return {
    id: data.id,
    userId: data.user_id,
    childName: data.child_name,
    situation: data.situation,
    complexity: data.complexity,
    tone: data.tone,
    imageStyle: data.image_style,
    content: data.content,
    images: data.images as string[],
    videoUrl: data.video_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getStory(id: string): Promise<Story | undefined> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    id: (data as any).id,
    userId: (data as any).user_id,
    childName: (data as any).child_name,
    situation: (data as any).situation,
    complexity: (data as any).complexity,
    tone: (data as any).tone,
    imageStyle: (data as any).image_style,
    content: (data as any).content,
    images: (data as any).images || [],
    videoUrl: (data as any).video_url || undefined,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  };
}

export async function getUserStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    situation: row.situation,
    complexity: row.complexity,
    tone: row.tone,
    imageStyle: row.image_style,
    content: row.content,
    images: row.images || [],
    videoUrl: row.video_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateStory(id: string, updates: Partial<Story>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.childName !== undefined) dbUpdates.child_name = updates.childName;
  if (updates.situation !== undefined) dbUpdates.situation = updates.situation;
  if (updates.complexity !== undefined) dbUpdates.complexity = updates.complexity;
  if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
  if (updates.imageStyle !== undefined) dbUpdates.image_style = updates.imageStyle;
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.images !== undefined) dbUpdates.images = updates.images as any;
  if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  // @ts-expect-error - Supabase update with dynamic fields
  const updateQuery: any = supabaseAdmin.from('stories').update(dbUpdates);
  await updateQuery.eq('id', id);
}

export async function deleteStory(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAllStories(): Promise<Story[]> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    situation: row.situation,
    complexity: row.complexity,
    tone: row.tone,
    imageStyle: row.image_style,
    content: row.content,
    images: row.images || [],
    videoUrl: row.video_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
