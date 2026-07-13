import { describe, it, expect, vi, beforeEach } from "vitest";
import { tasksService } from "@/services/tasksService";

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

const queryResult = (data: unknown, error: unknown = null) => ({ data, error });

// Chainable query stub: every method returns itself and it resolves like a promise
const makeQuery = (result: { data: unknown; error: unknown }) => {
  const query: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "delete", "eq", "order", "single"]) {
    query[method] = vi.fn().mockReturnValue(query);
  }
  query.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolve(result));
  return query as any;
};

describe("tasksService.getMyTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty list when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const tasks = await tasksService.getMyTasks();

    expect(tasks).toEqual([]);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("filters tasks by the signed-in user's id", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "worker-1" } }, error: null });
    const query = makeQuery(queryResult([{ id: "t1", title: "مهمة", assigned_to: "worker-1" }]));
    mockSupabase.from.mockReturnValue(query);

    const tasks = await tasksService.getMyTasks();

    expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
    expect(query.eq).toHaveBeenCalledWith("assigned_to", "worker-1");
    expect(tasks).toHaveLength(1);
  });
});

describe("tasksService.createTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stamps created_by from the session and defaults priority to medium", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "manager-1" } }, error: null });
    const query = makeQuery(queryResult({ id: "t1" }));
    mockSupabase.from.mockReturnValue(query);

    await tasksService.createTask({ title: "مهمة جديدة", assigned_to: "worker-1" });

    expect(query.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "مهمة جديدة",
        assigned_to: "worker-1",
        priority: "medium",
        created_by: "manager-1",
      }),
    ]);
    // Optional empty fields are omitted so PostgREST doesn't write nulls
    const inserted = (query.insert as ReturnType<typeof vi.fn>).mock.calls[0][0][0];
    expect(inserted).not.toHaveProperty("description");
    expect(inserted).not.toHaveProperty("due_date");
    expect(inserted).not.toHaveProperty("project_id");
  });
});

describe("tasksService.updateMyTaskProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends only the status/notes payload it is given (never other columns)", async () => {
    const query = makeQuery(queryResult({ id: "t1", status: "in_progress" }));
    mockSupabase.from.mockReturnValue(query);

    await tasksService.updateMyTaskProgress("t1", { status: "in_progress" });

    expect(query.update).toHaveBeenCalledWith({ status: "in_progress" });
    expect(query.eq).toHaveBeenCalledWith("id", "t1");
  });
});

describe("tasksService.getTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies the status filter when provided", async () => {
    const query = makeQuery(queryResult([]));
    mockSupabase.from.mockReturnValue(query);

    await tasksService.getTasks({ status: "done" });

    expect(query.eq).toHaveBeenCalledWith("status", "done");
  });
});
