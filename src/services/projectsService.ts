import { supabase } from '@/lib/supabase';
import { Project, CreateProjectDTO, UpdateProjectDTO, Service } from '@/types/portfolio';

interface ProjectServiceJunction {
  service: Service;
}

interface ProjectWithJunction extends Omit<Project, 'services'> {
  services: ProjectServiceJunction[];
}

export const projectsService = {
  async getProjects(filters?: { categorySlug?: string; search?: string; page?: number; limit?: number; publishedOnly?: boolean }) {
    let query = supabase
      .from('projects')
      .select('*, category:categories(*), project_media(*), services:project_services(service:services(*))', { count: 'exact' });

    if (filters?.publishedOnly) {
      query = query.eq('is_published', true);
    }

    if (filters?.categorySlug) {
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

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    let rawData = (data ?? []) as unknown as ProjectWithJunction[];
    if (filters?.categorySlug) {
      rawData = rawData.filter(p => p.category !== null);
    }

    // Flatten nested services from junction table
    const filteredData: Project[] = rawData.map(p => ({
      ...p,
      services: p.services?.map(ps => ps.service).filter(Boolean) ?? [],
    }));

    return { data: filteredData, count };
  },

  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, category:categories(*), project_media(*), services:project_services(service:services(*))')
      .eq('slug', slug)
      .single();
      
    if (error) throw error;

    // Flatten services from junction table
    const proj = data as unknown as ProjectWithJunction;
    return {
      ...proj,
      services: proj.services?.map(ps => ps.service).filter(Boolean) ?? [],
    } as Project;
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
  },

  async getProjectStats() {
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'estimated', head: true });

    const { count: newRequestsCount, error: requestsError } = await supabase
      .from('requests')
      .select('*', { count: 'estimated', head: true })
      .eq('status', 'new');

    const { count: totalRequestsCount, error: totalRequestsError } = await supabase
      .from('requests')
      .select('*', { count: 'estimated', head: true });

    if (projectsError || requestsError || totalRequestsError) {
      console.error('Stats fetch error:', projectsError || requestsError || totalRequestsError);
    }

    return {
      projects: projectsCount || 0,
      newRequests: newRequestsCount || 0,
      totalRequests: totalRequestsCount || 0,
    };
  }
};
