import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const hangingPromise = <T,>() => new Promise<T>(() => {});

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

describe("AuthProvider refresh bootstrap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fails closed to login (no infinite spinner) when role query hangs and no staff role exists", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh",
      user: {
        id: "user-1",
        email: "u@example.com",
        user_metadata: {},
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: session.user } });

    const single = vi.fn().mockReturnValue(hangingPromise());
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockSupabase.from.mockReturnValue({ select });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["manager", "worker"]}>
                  <div>Dashboard Home</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(8_100);
      await Promise.resolve();
      await Promise.resolve();
    });

    // No staff role could be resolved — the app fails closed to login
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("unblocks the dashboard via the metadata role when the profiles lookup fails", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh",
      user: {
        id: "user-2",
        email: "u2@example.com",
        user_metadata: { role: "worker" },
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: session.user } });

    const single = vi.fn().mockRejectedValue(new Error("Network error"));
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockSupabase.from.mockReturnValue({ select });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["manager", "worker"]}>
                  <div>Dashboard Home</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(10_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
  });

  it("treats a legacy admin profile as manager and allows manager-only content", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh",
      user: {
        id: "user-3",
        email: "u3@example.com",
        user_metadata: {},
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: session.user } });

    const single = vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockSupabase.from.mockReturnValue({ select });

    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <div>Users Section</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("Users Section")).toBeInTheDocument();
  });

  it("redirects a worker away from manager-only content to the dashboard", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh",
      user: {
        id: "user-4",
        email: "u4@example.com",
        user_metadata: {},
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: session.user } });

    const single = vi.fn().mockResolvedValue({ data: { role: "worker" }, error: null });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockSupabase.from.mockReturnValue({ select });

    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <div>Users Section</div>
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<div>Dashboard Home</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
  });
});
