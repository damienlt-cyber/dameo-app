import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { messages, max_tokens, system } = await req.json();

    const claudeKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeKey) {
      return new Response(JSON.stringify({ error: "Clé Claude non configurée" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const body: Record<string, unknown> = {
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens || 1000,
      messages,
    };
    if (system) body.system = system;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
