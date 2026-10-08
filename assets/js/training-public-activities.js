import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

const root = document.getElementById("training-public-activities");
const config = window.trainingCloudConfig || {};
let activities = [];
let unit = "lb";

function weight(value, sourceUnit) {
  const converted = sourceUnit === unit ? Number(value)
    : sourceUnit === "lb" ? Number(value) * 0.45359237 : Number(value) / 0.45359237;
  return `${Math.round(converted * 10) / 10} ${unit}`;
}

function render() {
  root.replaceChildren();
  const selected = window.location.hash.match(/^#session-(\d+)$/);
  const activity = selected ? activities[Number(selected[1])] : null;
  const toolbar = element("div", undefined, "training-public-toolbar");
  const back = element("a", activity ? "← All activities" : "← Training overview", "training-back-link");
  back.href = activity ? "#activities" : root.dataset.trainingUrl;
  const units = element("div", undefined, "training-public-units");
  units.setAttribute("role", "group");
  units.setAttribute("aria-label", "Exercise weight units");
  for (const value of ["lb", "kg"]) {
    const button = element("button", value);
    button.type = "button";
    button.setAttribute("aria-pressed", String(unit === value));
    button.addEventListener("click", () => { unit = value; render(); });
    units.append(button);
  }
  toolbar.append(back, units);
  root.append(toolbar);
  const shown = activity ? [activity] : activities;
  if (!shown.length) root.append(element("p", "No activities to show yet."));
  shown.forEach((item, index) => {
    const date = new Date(`${item.date}T12:00:00`);
    const label = Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-US", {
      month: "long", day: "numeric", year: "numeric",
    }).format(date);
    if (!activity) {
      const link = element("a", undefined, "training-public-session-card");
      link.href = `#session-${index}`;
      const copy = element("div");
      copy.append(element("span", label, "training-eyebrow"), element("h2", item.workout || "Workout"),
        element("p", `${item.exercises?.length || 0} exercises${item.duration_minutes != null ? ` · ${item.duration_minutes} min` : ""}`));
      link.append(copy, element("span", "View session →", "training-session-link"));
      root.append(link);
      return;
    }
    const detail = element("article", undefined, "training-session-detail");
    const header = element("header", undefined, "training-session-detail-header");
    const copy = element("div");
    copy.append(element("p", "SESSION RECORD", "training-eyebrow"), element("h1", item.workout || "Workout"),
      element("p", `${label} · ${item.period === "morning" ? "Morning" : "Evening"}`, "training-dashboard-date"));
    header.append(copy);
    detail.append(header);
    const metrics = element("section", undefined, "training-detail-summary training-public-metrics");
    const volume = (item.exercises || []).reduce((total, exercise) => total +
      (exercise.sets || []).reduce((sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0), 0);
    for (const [name, value] of [["Duration", item.duration_minutes != null ? `${item.duration_minutes} min` : "—"],
      ["Session RPE", item.session_rpe ?? "—"], ["Exercises", item.exercises?.length || 0],
      ["Training volume", weight(volume, item.weight_unit || "kg")]]) {
      const metric = element("article");
      metric.append(element("span", name), element("strong", String(value)));
      metrics.append(metric);
    }
    detail.append(metrics);
    const exercises = element("section", undefined, "training-session-exercises");
    exercises.append(element("h2", "Exercises"));
    (item.exercises || []).forEach((exercise, exerciseIndex) => {
      const card = element("article", undefined, "training-session-exercise");
      const title = element("div", undefined, "training-session-exercise-title");
      title.append(element("span", String(exerciseIndex + 1).padStart(2, "0")), element("h3", exercise.name));
      card.append(title);
      const sets = element("div", undefined, "training-session-set-list");
      (exercise.sets || []).forEach((set, setIndex) => {
        const readings = [];
        if (set.weight != null) readings.push(weight(set.weight, item.weight_unit || "kg"));
        if (set.reps != null) readings.push(`${set.reps} reps`);
        if (set.duration != null) readings.push(`${set.duration} min`);
        if (set.distance != null) readings.push(`${set.distance} km`);
        if (set.rpe != null) readings.push(`RPE ${set.rpe}`);
        const row = element("div", undefined, "training-session-set-row");
        row.append(element("span", `Set ${setIndex + 1}`), element("strong", readings.join(" · ") || "Recorded"));
        sets.append(row);
      });
      card.append(sets);
      if (exercise.note) card.append(element("p", exercise.note, "training-detail-note"));
      exercises.append(card);
    });
    detail.append(exercises);
    if (item.notes) {
      const notes = element("section", undefined, "training-detail-notes");
      notes.append(element("h2", "Session notes"), element("p", item.notes));
      detail.append(notes);
    }
    root.append(detail);
  });
}

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
  activities = (data || []).map(({ activity }) => activity);
  render();
  window.addEventListener("hashchange", render);
}

loadActivities();
