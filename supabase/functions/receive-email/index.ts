import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const url    = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const token  = url.searchParams.get("token");

    if (!userId && !token) throw new Error("user_id ou token requis");

    const supa = createClient(SUPA_URL, SUPA_KEY);

    // Résoudre le user_id depuis le token si nécessaire
    let resolvedUserId = userId;
    if (!resolvedUserId && token) {
      const { data, error } = await supa
        .from("user_profiles")
        .select("id")
        .eq("inbox_token", token)
        .single();
      if (error || !data) throw new Error("Token inconnu");
      resolvedUserId = data.id;
    }

    let from_addr = "expediteur@inconnu.fr";
    let subject   = "Sans objet";
    let body      = "";

    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const data = await req.json();
      from_addr  = data.from || data.sender   || from_addr;
      subject    = data.subject               || subject;
      body       = data.body || data.text || data.html || body;
    } else if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      // Mailgun / SendGrid / Postmark / Cloudflare Email Worker
      const form = await req.formData();
      from_addr  = form.get("from")?.toString()
               || form.get("sender")?.toString()          || from_addr;
      subject    = form.get("subject")?.toString()        || subject;
      body       = form.get("body-plain")?.toString()
               || form.get("text")?.toString()
               || form.get("stripped-text")?.toString()
               || form.get("body")?.toString()            || body;
    }

    const { error } = await supa.from("emails_inbox").insert({
      user_id:   resolvedUserId,
      from_addr,
      subject,
      body,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, subject }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
