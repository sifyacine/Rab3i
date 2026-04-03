import { supabase } from '@/lib/supabase';
import { Service, CreateServiceDTO, UpdateServiceDTO } from '@/types/portfolio';

export const servicesService = {
  async getServices(activeOnly = false) {
    let query = supabase
      .from('services')
      .select('*')
      .order('title_ar');
    
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
    // Delete existing links first
    const { error: deleteError } = await supabase
      .from('project_services')
      .delete()
      .eq('project_id', projectId);
      
    if (deleteError) throw deleteError;
    
    if (serviceIds.length === 0) return;
    
    // Insert new links
    const { error: insertError } = await supabase
      .from('project_services')
      .insert(serviceIds.map(sid => ({ project_id: projectId, service_id: sid })));
      
    if (insertError) throw insertError;
  }
};
