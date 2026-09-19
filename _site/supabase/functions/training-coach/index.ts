import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://harshitiwari.site",
  "http://127.0.0.1:4000",
  "http://localhost:4000",
]);

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin || "")
      ? origin || ""
      : "https://harshitiwari.site",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request.headers.get("Origin"));
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers });

  const authorization = request.headers.get("Authorization");
  if (!authorization)
    return new Response("Sign-in required", { status: 401, headers });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna";
  if (!supabaseUrl || !supabaseKey || !openaiKey) {
    return new Response("Coach is not configured yet", {
      status: 503,
      headers,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user)
    return new Response("Invalid sign-in", { status: 401, headers });

  const body = await request.json().catch(() => ({}));
  const question =
    typeof body.question === "string"
      ? body.question.trim().slice(0, 1000)
      : "";
  if (!question)
    return new Response("A question is required", { status: 400, headers });

  // RLS means this query can return only the authenticated user's records.
  const { data: sessions, error: sessionError } = await supabase
    .from("training_sessions")
    .select("occurred_at, payload")
    .order("occurred_at", { ascending: false })
    .limit(20);
  if (sessionError)
    return new Response("Could not read training data", {
      status: 500,
      headers,
    });

  const input = {
    question,
    recent_sessions: sessions || [],
    safety:
      "Give general training guidance only. Do not diagnose injury, prescribe medical treatment, or encourage max attempts when fatigue or pain is mentioned.",
  };
  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 450,
      instructions:
        "You are a concise, cautious strength and running coach. Use SI units. Explain uncertainty and suggest conservative progression.",
      input: JSON.stringify(input),
    }),
  });
  if (!openaiResponse.ok)
    return new Response("Coach request failed", { status: 502, headers });
  const result = await openaiResponse.json();
  return Response.json(
    { answer: result.output_text || "No coach response." },
    { headers },
  );
});
