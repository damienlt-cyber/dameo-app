import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encode base64url
function b64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - b.length % 4) % 4;
  return Uint8Array.from(atob(b + "=".repeat(pad)), c => c.charCodeAt(0));
}

// Sign a JWT for VAPID
async function signVapidJwt(audience: string, subject: string, privateKeyB64: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    aud: audience, exp: now + 86400, sub: subject
  })));
  const msg = `${header}.${payload}`;
  const keyData = b64urlDecode(privateKeyB64);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cryptoKey,
    new TextEncoder().encode(msg));
  return `${msg}.${b64url(new Uint8Array(sig))}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const VAPID_PUBLIC  = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const SUPA_URL      = Deno.env.get("SUPABASE_URL")!;
  const SUPA_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:contact@nomade7.app";

  try {
    const { user_id, title, body, url, tag } = await req.json();
    if (!user_id) throw new Error("user_id requis");

    const supa = createClient(SUPA_URL, SUPA_KEY);
    const { data: sub, error } = await supa
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", user_id)
      .single();
    if (error || !sub) throw new Error("Subscription introuvable pour cet utilisateur");

    const s = sub.subscription;
    const endpoint: string = s.endpoint;
    const origin = new URL(endpoint).origin;

    const jwt = await signVapidJwt(origin, VAPID_SUBJECT, VAPID_PRIVATE);
    const vapidHeader = `vapid t=${jwt},k=${VAPID_PUBLIC}`;

    const payload = JSON.stringify({ title, body, tag: tag || "nomade7", url: url || "/" });
    const encoded = new TextEncoder().encode(payload);

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": vapidHeader,
        "TTL": "86400",
      },
      body: encoded,
    });

    if (!resp.ok && resp.status !== 201) {
      throw new Error(`Push endpoint returned ${resp.status}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
});
