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
    // user_id passé en query param : ?user_id=xxx
    const url     = new URL(req.url);
    const userId  = url.searchParams.get("user_id");
    if (!userId) throw new Error("user_id requis en paramètre d'URL");

    let from_addr = "expediteur@inconnu.fr";
    let subject   = "Sans objet";
    let body      = "";

    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      // Zapier / Make.com / appel direct
      const data = await req.json();
      from_addr  = data.from || data.sender   || from_addr;
      subject    = data.subject               || subject;
      body       = data.body || data.text || data.html || body;
    } else if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      // Mailgun / SendGrid / Postmark inbound
      const form = await req.formData();
      from_addr  = form.get("from")?.toString()                      || from_addr;
      subject    = form.get("subject")?.toString()                   || subject;
      body       = form.get("body-plain")?.toString()
               || form.get("text")?.toString()
               || form.get("body")?.toString()                       || body;
    }

    const supa = createClient(SUPA_URL, SUPA_KEY);
    const { error } = await supa.from("emails_inbox").insert({
      user_id:   userId,
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
