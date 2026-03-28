import { supabaseAdmin } from './connection.js';

export async function createStory(data) {
  const { data: story, error } = await supabaseAdmin
    .from('stories')
    .insert({
      user_id: data.userId,
      child_name: data.childName,
      situation: data.situation,
      complexity: data.complexity,
      tone: data.tone,
      image_style: data.imageStyle,
      content: data.content,
      images: data.images,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapStoryFromDb(story);
}

export async function getStory(storyId) {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapStoryFromDb(data);
}

export async function getUserStories(userId) {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapStoryFromDb);
}

export async function getAllStories() {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapStoryFromDb);
}

export async function updateStory(storyId, updates) {
  const dbUpdates = {};

  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.images !== undefined) dbUpdates.images = updates.images;
  if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('stories')
    .update(dbUpdates)
    .eq('id', storyId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteStory(storyId) {
  const { error } = await supabaseAdmin
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) {
    throw new Error(error.message);
  }
}

function mapStoryFromDb(data) {
  return {
    id: data.id,
    userId: data.user_id,
    childName: data.child_name,
    situation: data.situation,
    complexity: data.complexity,
    tone: data.tone,
    imageStyle: data.image_style,
    content: data.content,
    images: data.images,
    videoUrl: data.video_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
