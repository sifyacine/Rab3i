import { supabase } from '@/lib/supabase';

export type RequestStatus = 'new' | 'analysis' | 'replied' | 'converted' | 'closed';

export interface GuestRequest {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  user_id: string | null;
  project_type: string;
  budget: string | null;
  details: string;
  service_ids: string[];
  status: RequestStatus;
  admin_notes: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestDTO {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  project_type: string;
  budget?: string;
  details: string;
  service_ids?: string[];
}

export const requestsService = {
  // Public: submit a request (no auth required)
  async submitRequest(data: CreateRequestDTO): Promise<GuestRequest> {
    const { data: result, error } = await supabase
      .from('requests')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as GuestRequest;
  },

  // Admin: get all requests
  async getRequests(filters?: { status?: RequestStatus; search?: string }) {
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`guest_name.ilike.%${filters.search}%,guest_email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as GuestRequest[];
  },

  // Admin: get single request
  async getRequestById(id: string): Promise<GuestRequest> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as GuestRequest;
  },

  // Admin: update request status or notes
  async updateRequest(id: string, updates: Partial<Pick<GuestRequest, 'status' | 'admin_notes' | 'project_id'>>) {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GuestRequest;
  },

  // Admin: delete request
  async deleteRequest(id: string) {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Client: get own requests (after signing up, linked by email)
  async getMyRequests(): Promise<GuestRequest[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GuestRequest[];
  }
};
