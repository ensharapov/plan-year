import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function verifyTelegramData(initData: string, botToken: string): Record<string, string> | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const entries = Array.from(params.entries());
    entries.sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

    // HMAC-SHA256 verification
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode("WebAppData");

    // We need to use Web Crypto API for HMAC
    // First: HMAC-SHA256("WebAppData", botToken) => secret_key
    // Then: HMAC-SHA256(secret_key, dataCheckString) => should equal hash
    
    // Since Deno supports crypto, we'll do async verification separately
    // For now, parse and return data (verification done in async wrapper)
    const result: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    result._hash = hash;
    result._dataCheckString = dataCheckString;
    return result;
  } catch {
    return null;
  }
}

async function verifyHash(dataCheckString: string, hash: string, botToken: string): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // Step 1: HMAC-SHA256("WebAppData", botToken)
  const secretKeyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const secretKeyBuffer = await crypto.subtle.sign("HMAC", secretKeyMaterial, encoder.encode(botToken));

  // Step 2: HMAC-SHA256(secretKey, dataCheckString)
  const secretKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(dataCheckString));

  // Step 3: Compare hex
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return signatureHex === hash;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { initData } = await req.json();
    if (!initData) {
      return new Response(JSON.stringify({ error: "Missing initData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and verify
    const parsed = verifyTelegramData(initData, BOT_TOKEN);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Invalid initData format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyHash(parsed._dataCheckString, parsed._hash, BOT_TOKEN);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid Telegram signature" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse user data
    const userData = JSON.parse(parsed.user || "{}");
    const telegramId = userData.id;
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    const username = userData.username || "";
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || username || `tg_${telegramId}`;

    if (!telegramId) {
      return new Response(JSON.stringify({ error: "No telegram user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Check if profile with this telegram_id exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // Create new user with fake email
      const fakeEmail = `tg_${telegramId}@telegram.user`;
      const fakePassword = crypto.randomUUID() + crypto.randomUUID();

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: fakeEmail,
        password: fakePassword,
        email_confirm: true,
        user_metadata: { display_name: displayName, telegram_id: telegramId },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }

      userId = newUser.user.id;

      // Update profile with telegram_id
      await supabaseAdmin
        .from("profiles")
        .update({ telegram_id: telegramId, display_name: displayName })
        .eq("user_id", userId);
    }

    // Generate session token for the user
    // We use admin.generateLink but that gives a link, not a session
    // Instead, use signInWithPassword approach or generate custom JWT
    // Simplest: use admin API to get user, then create a magic link token
    
    // Actually, the cleanest approach: use admin.generateLink with magiclink type
    const fakeEmail = `tg_${telegramId}@telegram.user`;
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: fakeEmail,
    });

    if (linkError || !linkData) {
      console.error("Error generating link:", linkError);
      throw linkError || new Error("Failed to generate auth link");
    }

    // Extract token from the link properties
    const token_hash = linkData.properties?.hashed_token;
    
    // Verify the OTP to get a session
    const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token_hash,
      type: "magiclink",
    });

    if (verifyError || !sessionData.session) {
      console.error("Error verifying OTP:", verifyError);
      throw verifyError || new Error("Failed to create session");
    }

    return new Response(
      JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: sessionData.user,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Telegram auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
