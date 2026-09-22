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
  const groqKey = Deno.env.get("GROQ_API_KEY");
  const model = Deno.env.get("GROQ_MODEL") || "openai/gpt-oss-120b";
  if (!supabaseUrl || !supabaseKey || !groqKey) {
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
    training_context: {
      units: "The dashboard defaults to lb entry, but advice should use SI units first and may show lb in parentheses.",
      current_block:
        "Five-week cycle: Week 0 deload, then Weeks 1–4 at RPE 6, 7, 8, and 9–10. Compound sessions use progressive warm-up sets, a top single only outside deload, then three back-off sets of five.",
      december_targets: {
        squat_kg: 120,
        deadlift_kg: 150,
        bench_kg: 80,
        overhead_press_kg: 55,
        five_k_minutes: 27,
      },
      weekly_structure:
        "Mon legs; Tue bench/chest/triceps; Wed run plus shoulders/forearms; Thu recovery walk plus run or bike; Fri deadlift; Sat run plus bike/swim; Sun run and rest. Running uses easy, fartlek, intervals, tempo, threshold, and long-run sessions.",
    },
    safety:
      "Give general training guidance only. Do not diagnose injury, prescribe medical treatment, or encourage max attempts when fatigue or pain is mentioned.",
  };
  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a concise, cautious strength and running coach. Answer only from the supplied private training context and recent sessions. Use SI units first and optionally add pounds in parentheses. Clearly distinguish recorded facts from suggestions. Explain uncertainty and suggest conservative progression. Do not diagnose injury, prescribe medical treatment, or present your answer as medical advice.",
          },
          { role: "user", content: JSON.stringify(input) },
        ],
        temperature: 0.35,
        max_completion_tokens: 900,
      }),
    },
  );
  if (!groqResponse.ok) {
    const detail = await groqResponse.text();
    console.error("Groq coach request failed", groqResponse.status, detail);
    return new Response("Coach request failed", { status: 502, headers });
  }
  const result = await groqResponse.json();
  const answer = String(result.choices?.[0]?.message?.content || "").trim();
  return Response.json(
    { answer: answer || "No coach response." },
    { headers },
  );
});
