import { supabase } from '@/lib/supabase';

interface BlogViewRow {
  views: number;
}

/**
 * Generates a URL-safe slug from a title.
 * - Converts to lowercase and replaces spaces with hyphens
 * - Strips characters that are unsafe for URLs (keeps Unicode/Arabic letters)
 * - Collapses multiple hyphens
 * - Falls back to timestamp-based slug if result is empty
 */
export function generateSlug(title: string): string {
  if (!title || !title.trim()) {
    // Fallback to timestamp to ensure unique non-empty slug
    return `post-${Date.now()}`;
  }

  const slug = title
    .toLowerCase()
    // Normalize Arabic diacritics (tashkeel) for cleaner slugs
    // Only strip specific Arabic diacritics range, not all combining marks
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Re-combine for other scripts (NFC normalizes combining marks back)
    .normalize('NFC')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Keep Unicode letters, numbers, and hyphens; strip everything else
    .replace(/[^\p{L}\p{N}-]/gu, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Fallback if slug is empty after sanitization (e.g., title was only symbols)
  if (!slug) {
    return `post-${Date.now()}`;
  }

  return slug;
}

/**
 * Generates a unique slug by appending a numeric suffix if needed.
 * @param baseSlug - The sanitized base slug
 * @param exists - Async function that checks if a slug exists in DB
 * @param maxAttempts - Max suffixed attempts (default 100)
 */
export async function uniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>,
  maxAttempts = 100
): Promise<string> {
  if (!(await exists(baseSlug))) {
    return baseSlug;
  }

  for (let i = 2; i <= maxAttempts; i++) {
    const candidate = `${baseSlug}-${i}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  // Last resort: append timestamp
  return `${baseSlug}-${Date.now()}`;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft' | 'scheduled';
  featured_image_url?: string;
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogDTO {
  title: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft' | 'scheduled';
  featured_image_url?: string;
  published_at?: string;
}

export const blogService = {
  async getBlogPosts(filters?: { published_only?: boolean; categorySlug?: string }) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (filters?.published_only) {
      query = query.eq('status', 'published');
    }

    if (filters?.categorySlug) {
      query = query.eq('category', filters.categorySlug);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as BlogPost[];
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Race-safe view increment: optimistic locking with compare-and-set
    // Retry once if first attempt didn't match (concurrent update)
    await this._incrementViewsSafely(data.id, data.views);

    return data as BlogPost;
  },

  /**
   * Atomically increments views using optimistic locking.
   * Only updates if current views match expected value.
   * Retries once on mismatch to handle race conditions.
   */
  async _incrementViewsSafely(postId: string, expectedViews: number, attempt = 1): Promise<void> {
    if (!supabase) return;

    const { data: updatedRow, error } = await supabase
      .from('blog_posts')
      .update({ views: expectedViews + 1 })
      .eq('id', postId)
      .eq('views', expectedViews)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    // Updated successfully on this optimistic attempt
    if (updatedRow) return;

    // If optimistic update matched no row (concurrent writer), retry with latest value
    if (attempt < 2) {
      const { data } = await supabase
        .from('blog_posts')
        .select('views')
        .eq('id', postId)
        .single<BlogViewRow>();

      if (data?.views === expectedViews + 1) {
        return;
      }

      if (typeof data?.views === 'number') {
        await this._incrementViewsSafely(postId, data.views, attempt + 1);
      }
    }
  },

  async createBlogPost(post: CreateBlogDTO): Promise<BlogPost> {
    // Generate slug from title using Unicode-safe generator
    const baseSlug = generateSlug(post.title);

    // Check for existing slugs and generate unique one
    const slug = await uniqueSlug(baseSlug, async (s) => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', s)
        .maybeSingle();
      return !!data;
    });

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          ...post,
          slug,
          views: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async updateBlogPost(id: string, updates: Partial<CreateBlogDTO>): Promise<BlogPost> {
    const updateData: Record<string, unknown> = { ...updates };

    // Update slug if title changes
    if (updates.title) {
      const baseSlug = generateSlug(updates.title);
      const slug = await uniqueSlug(baseSlug, async (s) => {
        // Exclude current post from check
        const { data } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', s)
          .neq('id', id)
          .maybeSingle();
        return !!data;
      });
      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async deleteBlogPost(id: string): Promise<void> {
    // First get the post to get image URL
    const post = await this.getBlogPostById(id);

    // Delete image if exists
    if (post.featured_image_url) {
      await this.deleteImage(post.featured_image_url);
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  },

  // Image upload and management
  async uploadImage(file: File, postId: string): Promise<string> {
    if (!file) throw new Error('No file provided');

    const fileExt = file.name.split('.').pop();
    const fileName = `${postId}-${Date.now()}.${fileExt}`;
    const filePath = `blog/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const match = imageUrl.match(/blog%2F(.+?)(\?|$)/);
      if (match) {
        const filePath = match[1];
        await supabase.storage
          .from('blog-images')
          .remove([`blog/${decodeURIComponent(filePath)}`]);
      }
    } catch (error) {
      console.warn('Failed to delete image:', error);
      // Don't throw - allow deletion to proceed even if image delete fails
    }
  },

  async updateBlogPostWithImage(
    id: string,
    updates: Partial<CreateBlogDTO>,
    imageFile?: File
  ): Promise<BlogPost> {
    const finalUpdates = { ...updates };

    // Upload image if provided
    if (imageFile) {
      const imageUrl = await this.uploadImage(imageFile, id);
      finalUpdates.featured_image_url = imageUrl;
    }

    return this.updateBlogPost(id, finalUpdates);
  },
};
