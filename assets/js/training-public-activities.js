import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const root = document.getElementById("training-public-activities");
const config = window.trainingCloudConfig || {};

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function loadActivities() {
  if (!root) return;
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    root.replaceChildren(element("p", "The activity feed is not available yet."));
    return;
  }
  const client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.rpc("public_training_activities");
  if (error) {
    root.replaceChildren(element("p", "The public activity feed is not available yet. Please check back soon."));
    return;
  }
  root.replaceChildren();
  if (!data?.length) root.append(element("p", "No activities to show yet."));
  for (const { activity } of data || []) {
    const card = element("article", undefined, "training-panel");
    const date = new Date(`${activity.date}T12:00:00`);
    const dateLabel = Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-US", {
      month: "long", day: "numeric", year: "numeric",
    }).format(date);
    card.append(
      element("p", `${dateLabel} · ${activity.period === "morning" ? "Morning" : "Evening"}`, "training-eyebrow"),
      element("h2", activity.workout || "Workout"),
    );
    const metrics = [];
    if (activity.duration_minutes != null) metrics.push(`${activity.duration_minutes} min`);
    if (activity.session_rpe != null) metrics.push(`Session RPE ${activity.session_rpe}`);
    if (metrics.length) card.append(element("p", metrics.join(" · ")));
    if (activity.notes) card.append(element("p", activity.notes));
    for (const exercise of activity.exercises || []) {
      const details = element("details");
      details.append(element("summary", `${exercise.name} · ${exercise.sets?.length || 0} sets`));
      const sets = element("ol");
      for (const set of exercise.sets || []) {
        const readings = [];
        if (set.weight != null) readings.push(`${set.weight} ${activity.weight_unit || "kg"}`);
        if (set.reps != null) readings.push(`${set.reps} reps`);
        if (set.duration != null) readings.push(`${set.duration} min`);
        if (set.distance != null) readings.push(`${set.distance} km`);
        if (set.rpe != null) readings.push(`RPE ${set.rpe}`);
        sets.append(element("li", readings.join(" · ") || "Recorded"));
      }
      details.append(sets);
      if (exercise.note) details.append(element("p", exercise.note));
      card.append(details);
    }
    root.append(card);
  }
}

loadActivities();
