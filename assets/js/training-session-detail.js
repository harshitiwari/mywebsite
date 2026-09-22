import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.0";

(() => {
  const root = document.getElementById("training-session-detail");
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const storageKey = "ht-training-sessions-v1";
  const kilogramsPerPound = 0.45359237;
  let session = readLocalSessions().find((item) => String(item.id) === id);
  let displayUnit = session?.weight_unit || "lb";

  function readLocalSessions() {
    try {
      const sessions = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(sessions) ? sessions : [];
    } catch {
      return [];
    }
  }

  function createElement(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  function convertWeight(value, sourceUnit, targetUnit) {
    if (sourceUnit === targetUnit) return value;
    return sourceUnit === "lb"
      ? value * kilogramsPerPound
      : value / kilogramsPerPound;
  }

  function formatWeight(value, sourceUnit) {
    const converted = convertWeight(Number(value), sourceUnit, displayUnit);
    return `${Math.round(converted * 10) / 10} ${displayUnit}`;
  }

  function sessionVolumeKg(item) {
    const sourceUnit = item.weight_unit || "kg";
    return (item.exercises || []).reduce(
      (total, exercise) =>
        total +
        (exercise.sets || []).reduce((sum, set) => {
          const kilograms =
            sourceUnit === "lb"
              ? Number(set.weight || 0) * kilogramsPerPound
              : Number(set.weight || 0);
          return sum + kilograms * Number(set.reps || 0);
        }, 0),
      0,
    );
  }

  function renderEmpty(message) {
    root.replaceChildren(
      createElement("p", "training-eyebrow", "PRIVATE TRAINING LOG"),
      createElement("h1", "", "Session unavailable"),
      createElement("p", "", message),
    );
    const link = createElement("a", "training-back-link", "Back to dashboard");
    link.href = "/training/dashboard/";
    root.appendChild(link);
  }

  function metricCard(label, value) {
    const card = createElement("article");
    card.append(
      createElement("span", "", label),
      createElement("strong", "", String(value)),
    );
    return card;
  }

  function render() {
    if (!id || !session) {
      renderEmpty(
        "Sign in and open this page from a saved session in your private dashboard.",
      );
      return;
    }

    const storedUnit = session.weight_unit || "kg";
    const header = createElement("header", "training-session-detail-header");
    const headingCopy = createElement("div");
    headingCopy.append(
      createElement("p", "training-eyebrow", "PRIVATE TRAINING LOG"),
      createElement("h1", "", session.template_label || "Training session"),
      createElement(
        "p",
        "training-dashboard-date",
        `${formatDate(session.date)} · ${session.period === "morning" ? "Morning" : "Evening"} · Week ${session.cycle_week ?? "—"}`,
      ),
    );

    const actions = createElement("div", "training-session-detail-actions");
    const unitLabel = createElement("label", "training-session-unit");
    unitLabel.appendChild(createElement("span", "", "Display"));
    const unitSelect = document.createElement("select");
    unitSelect.setAttribute("aria-label", "Display weight unit");
    ["lb", "kg"].forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit;
      option.textContent = unit;
      option.selected = displayUnit === unit;
      unitSelect.appendChild(option);
    });
    unitSelect.addEventListener("change", () => {
      displayUnit = unitSelect.value;
      render();
    });
    unitLabel.appendChild(unitSelect);
    const edit = createElement("a", "training-save-button", "Edit session");
    edit.href = `/training/dashboard/?edit=${encodeURIComponent(session.id)}`;
    const back = createElement("a", "training-back-link", "Back to dashboard");
    back.href = "/training/dashboard/";
    actions.append(unitLabel, edit, back);
    header.append(headingCopy, actions);

    const summary = createElement("section", "training-detail-summary");
    const bodyWeight = session.body_weight
      ? formatWeight(
          session.body_weight,
          session.body_weight_unit || storedUnit,
        )
      : "—";
    const volume = formatWeight(sessionVolumeKg(session), "kg");
    summary.append(
      metricCard("Duration", session.duration_minutes ? `${session.duration_minutes} min` : "—"),
      metricCard("Session RPE", session.session_rpe ?? "—"),
      metricCard("Body weight", bodyWeight),
      metricCard("Training volume", volume),
      metricCard(
        "Warm-up / cooldown",
        `${session.warmup_completed ? "Complete" : "—"} / ${session.cooldown_completed ? "Complete" : "—"}`,
      ),
    );

    const list = createElement("section", "training-session-exercises");
    const listHeading = createElement("div", "training-session-list-heading");
    listHeading.append(
      createElement("h2", "", "Session record"),
      createElement(
        "span",
        "",
        `${session.exercises?.length || 0} exercises · displayed in ${displayUnit}`,
      ),
    );
    list.appendChild(listHeading);

    (session.exercises || []).forEach((exercise, exerciseIndex) => {
      const card = createElement("article", "training-session-exercise");
      const title = createElement("div", "training-session-exercise-title");
      title.append(
        createElement("span", "", String(exerciseIndex + 1).padStart(2, "0")),
        createElement("h3", "", exercise.name),
      );
      card.appendChild(title);

      const sets = createElement("div", "training-session-set-list");
      (exercise.sets || []).forEach((set, index) => {
        const row = createElement("div", "training-session-set-row");
        row.appendChild(createElement("span", "", `Set ${index + 1}`));
        const details = [];
        if (set.weight !== null && set.weight !== undefined)
          details.push(formatWeight(set.weight, storedUnit));
        if (set.reps !== null && set.reps !== undefined)
          details.push(`${set.reps} reps`);
        if (set.duration !== null && set.duration !== undefined)
          details.push(`${set.duration} min`);
        if (set.distance !== null && set.distance !== undefined)
          details.push(`${set.distance} km`);
        if (set.rpe !== null && set.rpe !== undefined)
          details.push(`RPE ${set.rpe}`);
        row.appendChild(
          createElement("strong", "", details.join(" · ") || "Recorded"),
        );
        sets.appendChild(row);
      });
      card.appendChild(sets);
      if (exercise.note)
        card.appendChild(
          createElement("p", "training-detail-note", exercise.note),
        );
      list.appendChild(card);
    });

    if (session.notes) {
      const notes = createElement("section", "training-detail-notes");
      notes.append(
        createElement("h2", "", "Session notes"),
        createElement("p", "", session.notes),
      );
      list.appendChild(notes);
    }
    root.replaceChildren(header, summary, list);
  }

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
      renderEmpty(
        "Sign in to your private dashboard first, then open a saved session.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("training_sessions")
      .select("payload")
      .eq("client_id", id)
      .maybeSingle();
    if (!error && data?.payload) {
      session = data.payload;
      displayUnit = session.weight_unit || displayUnit;
    }
    render();
  }

  loadCloudSession();
})();
