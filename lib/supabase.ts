import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcoded credentials - ALWAYS use these (anon key is safe - protected by RLS)
const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3Zuandpb3N1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDczNzAsImV4cCI6MjA0ODEyMzM3MH0.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

// Create client - works on both server and client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Types for site content
export interface SiteContent {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'array';
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  [section: string]: {
    [key: string]: string | string[];
  };
}

// Fetch content for a specific page
export async function getPageContent(page: string): Promise<PageContent> {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('page', page);

  if (error) {
    console.error('Error fetching content:', error);
    return {};
  }

  const content: PageContent = {};
  data?.forEach((item: SiteContent) => {
    if (!content[item.section]) {
      content[item.section] = {};
    }
    if (item.type === 'array') {
      try {
        content[item.section][item.key] = JSON.parse(item.value);
      } catch {
        content[item.section][item.key] = item.value;
      }
    } else {
      content[item.section][item.key] = item.value;
    }
  });

  return content;
}

// Update content
export async function updateContent(
  page: string,
  section: string,
  key: string,
  value: string,
  type: 'text' | 'image' | 'array' = 'text'
) {
  const { data, error } = await supabase
    .from('site_content')
    .upsert(
      {
        page,
        section,
        key,
        value,
        type,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'page,section,key',
      }
    )
    .select();

  if (error) {
    console.error('Error updating content:', error);
    throw error;
  }

  return data;
}

// Upload image to Supabase Storage
export async function uploadImage(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Delete image from Supabase Storage
export async function deleteImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

// Get all content for admin
export async function getAllContent(): Promise<SiteContent[]> {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('page')
    .order('section')
    .order('key');

  if (error) {
    console.error('Error fetching all content:', error);
    return [];
  }

  return data || [];
}
