import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Check admin role
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather stats
    const [
      profilesRes,
      onboardedRes,
      sessionsRes,
      headlightsRes,
      transformsRes,
      streaksRes,
      recentUsersRes,
      funnelRes,
    ] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
      admin.from("yearly_sessions").select("id", { count: "exact", head: true }),
      admin.from("headlights").select("id", { count: "exact", head: true }),
      admin.from("state_transforms").select("id", { count: "exact", head: true }),
      admin.from("streaks").select("current_streak, longest_streak, total_energy_logged"),
      admin.from("profiles").select("display_name, telegram_id, onboarding_completed, created_at").order("created_at", { ascending: false }).limit(20),
      admin.from("yearly_sessions").select("current_step, status"),
    ]);

    // Calculate funnel
    const funnel: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, completed: 0 };
    (funnelRes.data || []).forEach((s: any) => {
      if (s.status === "completed") {
        funnel.completed++;
      } else {
        const step = String(s.current_step);
        if (funnel[step] !== undefined) funnel[step]++;
      }
    });

    // Streak stats
    const streakData = streaksRes.data || [];
    const avgStreak = streakData.length
      ? streakData.reduce((sum: number, s: any) => sum + s.current_streak, 0) / streakData.length
      : 0;
    const maxStreak = streakData.reduce((max: number, s: any) => Math.max(max, s.longest_streak), 0);
    const totalEnergy = streakData.reduce((sum: number, s: any) => sum + s.total_energy_logged, 0);

    // Today's activity
    const today = new Date().toISOString().slice(0, 10);
    const { count: todayHeadlights } = await admin
      .from("headlights")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today + "T00:00:00Z");

    const stats = {
      totalUsers: profilesRes.count || 0,
      onboardedUsers: onboardedRes.count || 0,
      totalSessions: sessionsRes.count || 0,
      totalHeadlights: headlightsRes.count || 0,
      totalTransforms: transformsRes.count || 0,
      todayHeadlights: todayHeadlights || 0,
      avgStreak: Math.round(avgStreak * 10) / 10,
      maxStreak,
      totalEnergy,
      funnel,
      recentUsers: recentUsersRes.data || [],
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
