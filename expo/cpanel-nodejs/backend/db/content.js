import { supabaseAdmin } from './connection.js';

export async function getAllPages() {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .order('menu_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapPageFromDb);
}

export async function getPage(slug) {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapPageFromDb(data);
}

export async function createPage(pageData) {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .insert({
      slug: pageData.slug,
      title: pageData.title,
      is_published: pageData.isPublished ?? false,
      show_in_menu: pageData.showInMenu ?? true,
      menu_order: pageData.menuOrder ?? 0,
      show_header: pageData.showHeader ?? true,
      show_footer: pageData.showFooter ?? true,
      metadata: pageData.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPageFromDb(data);
}

export async function updatePage(pageId, updates) {
  const dbUpdates = {};

  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
  if (updates.showInMenu !== undefined) dbUpdates.show_in_menu = updates.showInMenu;
  if (updates.menuOrder !== undefined) dbUpdates.menu_order = updates.menuOrder;
  if (updates.showHeader !== undefined) dbUpdates.show_header = updates.showHeader;
  if (updates.showFooter !== undefined) dbUpdates.show_footer = updates.showFooter;
  if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('pages')
    .update(dbUpdates)
    .eq('id', pageId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePage(pageId) {
  const { error } = await supabaseAdmin
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPageContents(pageId) {
  const { data, error } = await supabaseAdmin
    .from('page_contents')
    .select('*')
    .eq('page_id', pageId)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapPageContentFromDb);
}

export async function getPageContentsBySection(pageId, sectionId) {
  const { data, error } = await supabaseAdmin
    .from('page_contents')
    .select('*')
    .eq('page_id', pageId)
    .eq('section_id', sectionId)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapPageContentFromDb);
}

export async function createPageContent(contentData) {
  const { data, error } = await supabaseAdmin
    .from('page_contents')
    .insert({
      page_id: contentData.pageId,
      section_id: contentData.sectionId,
      type: contentData.type,
      content: contentData.content,
      order: contentData.order,
      styles: contentData.styles || {},
      metadata: contentData.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPageContentFromDb(data);
}

export async function updatePageContent(contentId, updates) {
  const dbUpdates = {};

  if (updates.pageId !== undefined) dbUpdates.page_id = updates.pageId;
  if (updates.sectionId !== undefined) dbUpdates.section_id = updates.sectionId;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.order !== undefined) dbUpdates.order = updates.order;
  if (updates.styles !== undefined) dbUpdates.styles = updates.styles;
  if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

  if (Object.keys(dbUpdates).length === 0) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('page_contents')
    .update(dbUpdates)
    .eq('id', contentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePageContent(contentId) {
  const { error } = await supabaseAdmin
    .from('page_contents')
    .delete()
    .eq('id', contentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reorderPageContents(pageId, sectionId, contentIds) {
  for (let i = 0; i < contentIds.length; i++) {
    await supabaseAdmin
      .from('page_contents')
      .update({ order: i })
      .eq('id', contentIds[i])
      .eq('page_id', pageId)
      .eq('section_id', sectionId);
  }
}

export async function getThemeSettings() {
  const { data, error } = await supabaseAdmin
    .from('theme_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching theme settings:', error);
  }

  return data || {};
}

export async function updateThemeSettings(updates) {
  const { data: existing } = await supabaseAdmin
    .from('theme_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('theme_settings')
      .update(updates)
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('theme_settings')
      .insert(updates);
  }

  return await getThemeSettings();
}

export async function getHeaderFooterContent(type) {
  const { data, error } = await supabaseAdmin
    .from('header_footer_content')
    .select('*')
    .eq('type', type)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching ${type} content:`, error);
  }

  return data || { type, content: '', links: [] };
}

export async function getAllHeaderFooterContents() {
  const { data, error } = await supabaseAdmin
    .from('header_footer_content')
    .select('*');

  if (error) {
    console.error('Error fetching header/footer content:', error);
    return [];
  }

  return data || [];
}

export async function updateHeaderFooterContent(type, updates) {
  const { data: existing } = await supabaseAdmin
    .from('header_footer_content')
    .select('id')
    .eq('type', type)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('header_footer_content')
      .update(updates)
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('header_footer_content')
      .insert({ type, ...updates });
  }
}

export async function initializeDefaultContent() {
  const existing = await getAllPages();
  if (existing.length > 0) {
    console.log('✅ Content pages already exist');
    return;
  }

  console.log('⚠️ No content pages found. Create them via the admin panel.');
}

function mapPageFromDb(data) {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    isPublished: data.is_published,
    showInMenu: data.show_in_menu,
    menuOrder: data.menu_order,
    showHeader: data.show_header,
    showFooter: data.show_footer,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapPageContentFromDb(data) {
  return {
    id: data.id,
    pageId: data.page_id,
    sectionId: data.section_id,
    type: data.type,
    content: data.content,
    order: data.order,
    styles: data.styles || {},
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
