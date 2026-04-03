import { supabase } from '@/lib/supabase';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/portfolio';

export const projectsService = {
  async getProjects(filters?: { categorySlug?: string; search?: string; page?: number; limit?: number }) {
    let query = supabase
      .from('projects')
      .select('*, category:categories(*), project_media(*)', { count: 'exact' });

    // Only get published for public view, unless maybe we pass a flag.
    // Given the context of public view finding published projects, the RLS policy will handle it for anon.
    // However, for admin view, they will see all projects.

    if (filters?.categorySlug) {
      // Need to filter by category slug. Since it's a join, we can use inner join syntax in supabase.
      query = query.eq('category.slug', filters.categorySlug);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    // Order by created at
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Supabase inner join filter might return null categories if not matched when filtering on it
    let filteredData = data as Project[];
    if (filters?.categorySlug) {
      filteredData = filteredData.filter(p => p.category !== null);
    }

    return { data: filteredData, count };
  },

  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, category:categories(*), project_media(*)')
      .eq('slug', slug)
      .single();
      
    if (error) throw error;
    return data as Project;
  },

  async createProject(project: CreateProjectDTO) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
      
    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: UpdateProjectDTO) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_project_views', { project_id: id });
    if (error) throw error;
  }
};
