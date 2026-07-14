// Supabase Edge Function: manage-users
// ---------------------------------------------------------------------------
// Privileged user administration for MANAGERS only. Runs with the service-role
// key (bypasses RLS), so authorization is enforced HERE, not by the database:
//   1. the caller's JWT is validated,
//   2. their profiles.role must be 'manager' (legacy 'admin' accepted),
//   3. only then is the requested action performed.
//
// Actions (JSON body { action, ... }):
//   create  { email, password, full_name, role, phone?, job_title? }
//   update  { userId, full_name?, phone?, job_title? }   profile fields only
//   set_role{ userId, role }                 role ∈ manager | worker
//   delete  { userId }
//   ban     { userId }                       indefinite ban (blocks login)
//   unban   { userId }
//
// Deploy:  supabase functions deploy manage-users
// The SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY secrets are
// injected automatically by the platform.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STAFF_ROLES = ["manager", "worker"];
const MANAGER_ROLES = ["manager", "admin"]; // legacy 'admin' == manager
// 100 years — Supabase has no "permanent" flag, so we ban for a very long time
const INDEFINITE_BAN = "876000h";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Function is not configured" }, 500);
  }

  // Service-role client: full admin powers, so we gate every call below.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── 1. Authenticate the caller ────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Missing authorization" }, 401);

  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user) return json({ error: "Invalid session" }, 401);

  // ── 2. Require a manager ──────────────────────────────────────────────────
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.user.id)
    .single();

  if (!callerProfile || !MANAGER_ROLES.includes(callerProfile.role)) {
    return json({ error: "Manager privileges required" }, 403);
  }

  // ── 3. Parse & dispatch ───────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = String(body.action ?? "");
  const callerId = caller.user.id;

  try {
    switch (action) {
      case "create": {
        const email = String(body.email ?? "").trim();
        const password = String(body.password ?? "");
        const full_name = String(body.full_name ?? "").trim();
        const role = String(body.role ?? "");
        const phone = body.phone ? String(body.phone).trim() : null;
        const job_title = body.job_title ? String(body.job_title).trim() : null;

        if (!email || !password) return json({ error: "البريد وكلمة المرور مطلوبان" }, 400);
        if (password.length < 6) return json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, 400);
        if (!STAFF_ROLES.includes(role)) return json({ error: "الرتبة غير صالحة" }, 400);

        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // manager-provisioned → no email round-trip
          user_metadata: { full_name },
        });
        if (createErr || !created?.user) {
          return json({ error: createErr?.message ?? "تعذّر إنشاء الحساب" }, 400);
        }

        // The on_auth_user_created trigger may have inserted a 'pending' row;
        // upsert the authoritative profile with the chosen role.
        const { error: profileErr } = await admin.from("profiles").upsert({
          id: created.user.id,
          email,
          full_name,
          role,
          phone,
          job_title,
          is_banned: false,
        });
        if (profileErr) {
          // Roll back the half-created account so it can't linger role-less.
          // handle_new_user may have inserted a 'pending' profile row, so
          // remove both the auth user and that row.
          await admin.auth.admin.deleteUser(created.user.id);
          await admin.from("profiles").delete().eq("id", created.user.id);
          return json({ error: profileErr.message }, 400);
        }

        return json({ ok: true, id: created.user.id });
      }

      case "update": {
        // Profile fields only — a role change must go through set_role (which
        // guards against self-demote), so "role" is deliberately ignored here.
        const userId = String(body.userId ?? "");
        if (!userId) return json({ error: "معرّف المستخدم مطلوب" }, 400);

        const updates: Record<string, unknown> = {};
        if ("full_name" in body) updates.full_name = body.full_name == null ? null : String(body.full_name).trim();
        if ("phone" in body) updates.phone = body.phone == null ? null : (String(body.phone).trim() || null);
        if ("job_title" in body) updates.job_title = body.job_title == null ? null : (String(body.job_title).trim() || null);

        if (Object.keys(updates).length === 0) return json({ ok: true });

        const { error } = await admin.from("profiles").update(updates).eq("id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      case "set_role": {
        const userId = String(body.userId ?? "");
        const role = String(body.role ?? "");
        if (!userId) return json({ error: "معرّف المستخدم مطلوب" }, 400);
        if (!STAFF_ROLES.includes(role)) return json({ error: "الرتبة غير صالحة" }, 400);
        if (userId === callerId) return json({ error: "لا يمكنك تغيير رتبتك بنفسك" }, 400);

        const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      case "delete": {
        const userId = String(body.userId ?? "");
        if (!userId) return json({ error: "معرّف المستخدم مطلوب" }, 400);
        if (userId === callerId) return json({ error: "لا يمكنك حذف حسابك بنفسك" }, 400);

        const { error: delErr } = await admin.auth.admin.deleteUser(userId);
        // Continue even if the auth user is already gone; clean the profile row
        if (delErr && !/not found/i.test(delErr.message)) {
          return json({ error: delErr.message }, 400);
        }
        const { error: profDelErr } = await admin.from("profiles").delete().eq("id", userId);
        if (profDelErr) return json({ error: profDelErr.message }, 400);
        return json({ ok: true });
      }

      case "ban":
      case "unban": {
        const userId = String(body.userId ?? "");
        if (!userId) return json({ error: "معرّف المستخدم مطلوب" }, 400);
        if (userId === callerId) return json({ error: "لا يمكنك حظر حسابك بنفسك" }, 400);

        const banned = action === "ban";
        const { error: banErr } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: banned ? INDEFINITE_BAN : "none",
        });
        if (banErr) return json({ error: banErr.message }, 400);

        // Keep the profiles display-mirror in sync; report failure so the auth
        // ban and the dashboard badge can't silently diverge.
        const { error: mirrorErr } = await admin
          .from("profiles")
          .update({ is_banned: banned })
          .eq("id", userId);
        if (mirrorErr) return json({ error: mirrorErr.message }, 400);
        return json({ ok: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
