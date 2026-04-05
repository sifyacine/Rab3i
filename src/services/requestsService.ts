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
  service_ids: string[] | null;  // jsonb array, may be null
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
    // Build payload — omit undefined fields so PostgREST doesn't include them in columns list
    const payload: Record<string, unknown> = {
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      details: data.details,
      project_type: data.project_type,
      service_ids: data.service_ids ?? [],   // jsonb column — always an array
    };
    if (data.guest_phone) payload.guest_phone = data.guest_phone;
    if (data.budget) payload.budget = data.budget;

    const { data: result, error } = await supabase
      .from('requests')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
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
    if (!supabase) return [];

    // Get authenticated user to filter by their user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
     
    if (authError || !user) {
      // Not authenticated — return empty array for safety
      return [];
    }

    const { data: linkedRequests, error: linkedError } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (linkedError) throw linkedError;

    const userEmail = user.email?.trim();
    if (!userEmail) {
      return (linkedRequests ?? []) as GuestRequest[];
    }

    // Also include legacy requests submitted before account creation
    // (same email, not yet linked to user_id)
    const { data: legacyRequests, error: legacyError } = await supabase
      .from('requests')
      .select('*')
      .is('user_id', null)
      .ilike('guest_email', userEmail)
      .order('created_at', { ascending: false });

    if (legacyError) throw legacyError;

    const mergedById = new Map<string, GuestRequest>();
    for (const request of linkedRequests ?? []) {
      mergedById.set(request.id, request as GuestRequest);
    }
    for (const request of legacyRequests ?? []) {
      mergedById.set(request.id, request as GuestRequest);
    }

    return Array.from(mergedById.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Admin: get most recent requests for dashboard
  async getRecentRequests(limit: number = 5): Promise<GuestRequest[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as GuestRequest[];
  }
};
