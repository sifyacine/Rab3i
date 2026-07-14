import { supabase } from "@/lib/supabase";

export type TaskStatus = "pending" | "in_progress" | "done" | "canceled";
export type TaskPriority = "low" | "medium" | "high";

// Shared label/colour maps (kept in the service so page components stay
// component-only — importing these from a page breaks React Fast Refresh)
export const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending:     { label: "قيد الانتظار", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  in_progress: { label: "قيد التنفيذ", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  done:        { label: "مكتملة", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  canceled:    { label: "ملغاة", className: "bg-muted text-muted-foreground border-border" },
};

export const taskPriorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "عالية", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  medium: { label: "متوسطة", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  low:    { label: "منخفضة", className: "bg-muted text-muted-foreground border-border" },
};

export interface TaskAssignee {
  id: string;
  full_name: string | null;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  project_id: string | null;
  created_by: string | null;
  worker_notes: string | null;
  created_at: string;
  updated_at: string;
  // Embedded relations (see TASK_SELECT)
  assignee?: TaskAssignee | null;
  project?: { id: string; title_ar: string | null } | null;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to: string;
  project_id?: string | null;
}

// Two FKs point at profiles (assigned_to, created_by) — disambiguate by column
const TASK_SELECT =
  "*, assignee:profiles!assigned_to(id, full_name, email), project:projects!project_id(id, title_ar)";

export const tasksService = {
  // Manager: all tasks, optionally filtered
  async getTasks(filters?: { status?: TaskStatus; assignedTo?: string }) {
    let query = supabase
      .from("tasks")
      .select(TASK_SELECT)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  },

  // Worker: only tasks assigned to the signed-in user (RLS enforces the same)
  async getMyTasks(): Promise<Task[]> {
    if (!supabase) return [];

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return [];

    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_SELECT)
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  // Manager: tasks of one worker (UserDetails page)
  async getTasksByAssignee(userId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_SELECT)
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Task[];
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_SELECT)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Task;
  },

  async createTask(input: CreateTaskDTO) {
    const { data: { user } } = await supabase.auth.getUser();

    const payload: Record<string, unknown> = {
      title: input.title,
      assigned_to: input.assigned_to,
      priority: input.priority ?? "medium",
      created_by: user?.id ?? null,
    };
    if (input.description) payload.description = input.description;
    if (input.due_date) payload.due_date = input.due_date;
    if (input.project_id) payload.project_id = input.project_id;

    const { data, error } = await supabase
      .from("tasks")
      .insert([payload])
      .select(TASK_SELECT)
      .single();
    if (error) throw error;
    return data as Task;
  },

  // Manager: edit any task field
  async updateTask(id: string, updates: Partial<Pick<Task,
    "title" | "description" | "status" | "priority" | "due_date" | "assigned_to" | "project_id"
  >>) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select(TASK_SELECT)
      .single();
    if (error) throw error;
    return data as Task;
  },

  // Worker: update progress on own task (status + notes only)
  async updateMyTaskProgress(id: string, updates: { status?: TaskStatus; worker_notes?: string }) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select(TASK_SELECT)
      .single();
    if (error) throw error;
    return data as Task;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
