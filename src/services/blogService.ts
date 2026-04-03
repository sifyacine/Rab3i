import { supabase } from '@/lib/supabase';

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

    // Increment views
    await supabase
      .from('blog_posts')
      .update({ views: (data?.views || 0) + 1 })
      .eq('id', data.id);

    return data as BlogPost;
  },

  async createBlogPost(post: CreateBlogDTO): Promise<BlogPost> {
    // Generate slug from title
    const slug = post.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

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
    const updateData: any = { ...updates };

    // Update slug if title changes
    if (updates.title) {
      updateData.slug = updates.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
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
    let finalUpdates = { ...updates };

    // Upload image if provided
    if (imageFile) {
      const imageUrl = await this.uploadImage(imageFile, id);
      finalUpdates.featured_image_url = imageUrl;
    }

    return this.updateBlogPost(id, finalUpdates);
  },
};
