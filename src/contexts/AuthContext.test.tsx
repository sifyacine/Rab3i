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
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not keep spinner forever when role query hangs during refresh", async () => {
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
      <MemoryRouter initialEntries={["/portal"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="client">
                  <div>Portal Home</div>
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

    expect(screen.getByText("Portal Home")).toBeInTheDocument();
  });

  it("initAuth completes and unblocks route even when role lookup fails", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh",
      user: {
        id: "user-2",
        email: "u2@example.com",
        user_metadata: { role: "client" },
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: session.user } });

    const single = vi.fn().mockRejectedValue(new Error("Network error"));
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockSupabase.from.mockReturnValue({ select });

    render(
      <MemoryRouter initialEntries={["/portal"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="client">
                  <div>Portal Home</div>
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

    expect(screen.getByText("Portal Home")).toBeInTheDocument();
  });
 });
