import { supabase } from '@/lib/supabase';
import { Service, CreateServiceDTO, UpdateServiceDTO } from '@/types/portfolio';

export const servicesService = {
  async getServices(activeOnly = false) {
    let query = supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title_ar', { ascending: true });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
      
    const { data, error } = await query;
    if (error) throw error;
    return data as Service[];
  },

  async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Service;
  },

  async createService(service: CreateServiceDTO) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
      
    if (error) throw error;
    return data as Service;
  },

  async updateService(id: string, updates: UpdateServiceDTO) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Service;
  },

  async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  async getProjectServices(projectId: string) {
    const { data, error } = await supabase
      .from('project_services')
      .select('service_id, services(*)')
      .eq('project_id', projectId);
      
    if (error) throw error;
    return (data?.map((d: { services: Service | Service[] }) => (Array.isArray(d.services) ? d.services[0] : d.services)) ?? []) as Service[];
  },

  async setProjectServices(projectId: string, serviceIds: string[]) {
    // Differential update: only delete extras and insert new ones
    // This avoids data loss if insert fails (vs delete-then-insert)
    
    // 1. Fetch current links
    const { data: currentLinks, error: fetchError } = await supabase
      .from('project_services')
      .select('service_id')
      .eq('project_id', projectId);
      
    if (fetchError) throw fetchError;
    
    const currentServiceIds = new Set(currentLinks?.map(l => l.service_id) ?? []);
    const desiredServiceIds = new Set(serviceIds);
    
    // 2. Delete only extras (in DB but not in desired list)
    const extras = [...currentServiceIds].filter(id => !desiredServiceIds.has(id));
    if (extras.length > 0) {
      const { error: deleteError } = await supabase
        .from('project_services')
        .delete()
        .eq('project_id', projectId)
        .in('service_id', extras);
        
      if (deleteError) throw deleteError;
    }
    
    // 3. Insert only new ones (in desired list but not in DB)
    const toInsert = serviceIds.filter(id => !currentServiceIds.has(id));
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('project_services')
        .insert(toInsert.map(sid => ({ project_id: projectId, service_id: sid })));
        
      if (insertError) throw insertError;
    }
  }
};
