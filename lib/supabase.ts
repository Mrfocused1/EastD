import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

// Create a mock client for when env vars are not available
const createMockClient = (): SupabaseClient => {
  const mockResult = { data: [], error: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockQuery = (): any => {
    const query = {
      eq: () => createMockQuery(),
      in: () => createMockQuery(),
      select: () => createMockQuery(),
      order: () => createMockQuery(),
      single: () => Promise.resolve(mockResult),
      then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve),
      catch: () => Promise.resolve(mockResult),
      finally: () => Promise.resolve(mockResult),
    };
    return query;
  };
  return {
    from: () => ({
      select: createMockQuery,
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      upsert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as SupabaseClient;
};

// Fallback configuration (public anon key - safe to expose)
const FALLBACK_CONFIG = {
  url: 'https://fhgvnjwiasusjfevimcw.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3Zuandpb3N1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NDczNzAsImV4cCI6MjA0ODEyMzM3MH0.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg'
};

// Validate environment variables
const validateEnvVars = (): { url: string; key: string } | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if env vars exist and are not empty
  if (!supabaseUrl || !supabaseAnonKey) {
    // Use fallback if env vars not available
    return FALLBACK_CONFIG;
  }

  const trimmedUrl = supabaseUrl.trim();
  const trimmedKey = supabaseAnonKey.trim();

  if (trimmedUrl === '' || trimmedKey === '') {
    return FALLBACK_CONFIG;
  }

  // Validate URL format
  try {
    new URL(trimmedUrl);
  } catch {
    return FALLBACK_CONFIG;
  }

  // Validate API key format (should be a JWT with 3 parts)
  if (!trimmedKey.includes('.') || trimmedKey.split('.').length !== 3) {
    return FALLBACK_CONFIG;
  }

  return { url: trimmedUrl, key: trimmedKey };
};

// Get or create the Supabase client (lazy initialization)
const getSupabaseClient = (): SupabaseClient => {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get config (always returns valid config due to fallback)
  const config = validateEnvVars() || FALLBACK_CONFIG;

  // Create the real client
  try {
    supabaseInstance = createClient(config.url, config.key);
    return supabaseInstance;
  } catch (error) {
    console.error('Supabase: Failed to create client:', error);
    // Last resort: use mock client
    supabaseInstance = createMockClient();
    return supabaseInstance;
  }
};

// Export a proxy that lazily initializes the client on first access
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
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
