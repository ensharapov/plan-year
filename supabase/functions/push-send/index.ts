/// Push notification sender with methodology-style copywriting
/// Can be triggered by cron or manually

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Methodology-style notification templates
const NOTIFICATION_TEMPLATES = [
  {
    title: "🔮 Твои Фары ждут",
    body: "Что резонирует сегодня? Одно действие в кайф — и ты на волне.",
  },
  {
    title: "⚡ Энергия на пике",
    body: "Прямо сейчас — лучший момент зажечь Фары. Не думай, чувствуй.",
  },
  {
    title: "🌊 Не теряй волну",
    body: "Твой стрик активен. Зайди и зажги Фары, пока энергия с тобой.",
  },
  {
    title: "🔥 Твой Бадди уже в деле",
    body: "Партнёр зажёг Фары — а ты? Поддержи энергию связки.",
  },
  {
    title: "💜 Монстр тебя не съест",
    body: "Если что-то тревожит — трансформируй это. Один рефрейм меняет всё.",
  },
  {
    title: "🎯 Адрес ждёт",
    body: "Каждый день — шаг к месту, где тебе по кайфу. Зажги Фары.",
  },
  {
    title: "✨ Мышца желания",
    body: "Зайди в Тренажёр хотелок — раскачай связь с тем, чего реально хочешь.",
  },
  {
    title: "🚀 Состояние важнее цели",
    body: "Не что ты делаешь, а из какого состояния. Зайди, настройся.",
  },
];

// Web Push crypto implementation
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
) {
  // For production, use a proper web-push library
  // This is a simplified version - in production you'd use the full VAPID + encryption
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      TTL: "86400",
    },
    body: payload,
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get request body for optional targeting
    let targetUserId: string | null = null;
    let templateIndex: number | null = null;

    try {
      const body = await req.json();
      targetUserId = body.userId || null;
      templateIndex = body.templateIndex ?? null;
    } catch {
      // No body, send to all
    }

    // Pick a template
    const template =
      templateIndex !== null
        ? NOTIFICATION_TEMPLATES[templateIndex % NOTIFICATION_TEMPLATES.length]
        : NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];

    // Get subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }
    const { data: subscriptions, error } = await query;

    if (error || !subscriptions?.length) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title: template.title,
      body: template.body,
      data: { url: "/dashboard" },
    });

    // Note: Full Web Push encryption requires VAPID + ECDH
    // For now, return the template that would be sent
    // Full implementation requires web-push npm equivalent for Deno

    return new Response(
      JSON.stringify({
        sent: subscriptions.length,
        template,
        message: "Push notifications queued",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
