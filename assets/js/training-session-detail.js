import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

(() => {
  const root = document.getElementById("training-session-detail");
  if (!root) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const storageKey = "ht-training-sessions-v1";
  const read = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(sessions) ? sessions : [];
    } catch {
      return [];
    }
  };
  const date = (value) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  const text = (value) => document.createTextNode(value);
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.appendChild(text(value));
    return node;
  };
  const renderEmpty = (message) => {
    root.replaceChildren(
      element("p", "training-eyebrow", "PRIVATE TRAINING LOG"),
      element("h1", "", "Session unavailable"),
      element("p", "", message),
    );
    const link = element("a", "training-back-link", "Back to dashboard");
    link.href = "/training/dashboard/";
    root.appendChild(link);
  };
  let session = read().find((item) => item.id === id);
  const render = () => {
  if (!id || !session) {
    renderEmpty("Sign in and open this page from a saved session in your private dashboard.");
    return;
  }
  const unit = session.weight_unit || "kg";
  const header = element("header", "training-session-detail-header");
  header.append(
    element("p", "training-eyebrow", "PRIVATE TRAINING LOG"),
    element("h1", "", session.template_label || "Training session"),
    element(
      "p",
      "training-dashboard-date",
      `${date(session.date)} · ${session.period === "morning" ? "Morning" : "Evening"} · Week ${session.cycle_week ?? "—"}`,
    ),
  );
  const actions = element("div", "training-session-detail-actions");
  const edit = element("a", "training-save-button", "Edit session");
  edit.href = `/training/dashboard/?edit=${encodeURIComponent(session.id)}`;
  const back = element("a", "training-back-link", "Back to dashboard");
  back.href = "/training/dashboard/";
  actions.append(edit, back);
  header.appendChild(actions);
  const summary = element("section", "training-detail-summary");
  [
    ["Duration", session.duration_minutes ? `${session.duration_minutes} min` : "—"],
    ["Session RPE", session.session_rpe ?? "—"],
    ["Body weight", session.body_weight ? `${session.body_weight} ${session.body_weight_unit || unit}` : "—"],
    ["Warm-up / cooldown", `${session.warmup_completed ? "✓" : "—"} / ${session.cooldown_completed ? "✓" : "—"}`],
  ].forEach(([label, value]) => {
    const card = element("article");
    card.append(element("span", "", label), element("strong", "", String(value)));
    summary.appendChild(card);
  });
  const list = element("section", "training-session-exercises");
  list.appendChild(element("h2", "", "Session record"));
  (session.exercises || []).forEach((exercise) => {
    const card = element("article", "training-session-exercise");
    card.appendChild(element("h3", "", exercise.name));
    const sets = element("ul", "training-session-set-list");
    (exercise.sets || []).forEach((set, index) => {
      const parts = [`Set ${index + 1}`];
      if (set.weight !== null && set.weight !== undefined)
        parts.push(`${set.weight} ${unit}`);
      if (set.reps !== null && set.reps !== undefined) parts.push(`${set.reps} reps`);
      if (set.duration !== null && set.duration !== undefined)
        parts.push(`${set.duration} min`);
      if (set.distance !== null && set.distance !== undefined)
        parts.push(`${set.distance} km`);
      if (set.rpe !== null && set.rpe !== undefined) parts.push(`RPE ${set.rpe}`);
      sets.appendChild(element("li", "", parts.join(" · ")));
    });
    card.appendChild(sets);
    if (exercise.note) card.appendChild(element("p", "training-detail-note", exercise.note));
    list.appendChild(card);
  });
  if (session.notes) {
    const notes = element("section", "training-detail-notes");
    notes.append(element("h2", "", "Session notes"), element("p", "", session.notes));
    list.appendChild(notes);
  }
  root.replaceChildren(header, summary, list);
  };

  async function loadCloudSession() {
    const config = window.trainingCloudConfig || {};
    if (!config.supabaseUrl || !config.supabasePublishableKey || !id) {
      render();
      return;
    }
    const supabase = createClient(
      config.supabaseUrl,
      config.supabasePublishableKey,
      { auth: { experimental: { passkey: true } } },
    );
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      renderEmpty("Sign in to your private dashboard first, then open a saved session.");
      return;
    }
    const { data, error } = await supabase
      .from("training_sessions")
      .select("payload")
      .eq("client_id", id)
      .maybeSingle();
    if (!error && data?.payload) session = data.payload;
    render();
  }

  loadCloudSession();
})();
