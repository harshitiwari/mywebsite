(function () {
  const templates = {
    walk_stretch: {
      label: "Light walk + stretch",
      exercises: [
        { name: "Light Walk", mode: "cardio" },
        { name: "Big 5 Mobility", mode: "mobility" },
      ],
    },
    walk: {
      label: "Light walk",
      exercises: [{ name: "Walk", mode: "cardio" }],
    },
    run: {
      label: "Run",
      exercises: [{ name: "Run", mode: "cardio" }],
    },
    legs: {
      label: "Legs · Squat focus",
      exercises: [
        { name: "ATG Back Squat", mode: "strength", role: "compound" },
        { name: "Leg Press", mode: "strength" },
        { name: "Leg Curl", mode: "strength" },
        { name: "Leg Extension", mode: "strength" },
        { name: "Calf Raise", mode: "strength" },
      ],
    },
    chest_triceps: {
      label: "Bench · Chest · Triceps",
      exercises: [
        { name: "Bench Press", mode: "strength", role: "compound" },
        { name: "Incline Dumbbell Press", mode: "strength" },
        { name: "Chest Fly", mode: "strength" },
        { name: "Triceps Pushdown", mode: "strength" },
        { name: "Overhead Triceps Extension", mode: "strength" },
      ],
    },
    shoulders_forearms: {
      label: "Shoulders · Forearms",
      exercises: [
        {
          name: "Standing Barbell Overhead Press",
          mode: "strength",
          role: "compound",
        },
        {
          name: "Seated Dumbbell Press",
          mode: "strength",
          baseline: "35 lb per hand × 10 easy",
        },
        { name: "Lateral Raise", mode: "strength" },
        { name: "Rear-Delt Fly", mode: "strength" },
        { name: "Wrist Curl", mode: "strength" },
        { name: "Reverse Wrist Curl", mode: "strength" },
      ],
    },
    run_bike: {
      label: "Run or bike",
      exercises: [
        { name: "Run", mode: "cardio" },
        { name: "Cycling", mode: "cardio" },
      ],
    },
    deadlift: {
      label: "Deadlift · Back · Grip",
      exercises: [
        { name: "Deadlift", mode: "strength", role: "compound" },
        { name: "Romanian Deadlift", mode: "strength" },
        { name: "Lat Pulldown", mode: "strength" },
        { name: "Seated Row", mode: "strength" },
        { name: "Dead Hang", mode: "mobility" },
      ],
    },
    bike_swim: {
      label: "Bike or swim",
      exercises: [
        { name: "Cycling", mode: "cardio" },
        { name: "Swimming", mode: "cardio" },
      ],
    },
    rest: {
      label: "Rest · Recovery",
      exercises: [{ name: "Recovery / Mobility", mode: "recovery" }],
    },
    custom: {
      label: "Custom session",
      exercises: [{ name: "Exercise", mode: "strength" }],
    },
  };

  const weeklySchedule = [
    { morning: "run", evening: "rest" },
    { morning: "walk_stretch", evening: "legs" },
    { morning: "walk", evening: "chest_triceps" },
    { morning: "run", evening: "shoulders_forearms" },
    { morning: "walk", evening: "run_bike" },
    { morning: "walk", evening: "deadlift" },
    { morning: "run", evening: "bike_swim" },
  ];

  const modeFields = {
    strength: [
      { key: "weight", label: "Weight", placeholder: "kg", step: "0.5" },
      { key: "reps", label: "Reps", placeholder: "reps", step: "1" },
    ],
    cardio: [
      { key: "duration", label: "Duration", placeholder: "min", step: "1" },
      { key: "distance", label: "Distance", placeholder: "km", step: "0.1" },
    ],
    mobility: [
      { key: "duration", label: "Duration", placeholder: "min", step: "1" },
      { key: "rounds", label: "Rounds", placeholder: "rounds", step: "1" },
    ],
    recovery: [
      { key: "duration", label: "Duration", placeholder: "min", step: "1" },
      { key: "quality", label: "Quality", placeholder: "1–5", step: "1" },
    ],
  };

  const programWeeks = {
    1: {
      kicker: "WEEK 1 · RPE 6",
      title: "Technique and repeatability",
      copy: "Main lift: 3 × 5. Leave about four good reps available and make every repetition look the same.",
      compound: { sets: 3, reps: [5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    2: {
      kicker: "WEEK 2 · RPE 7",
      title: "Add load without changing the lift",
      copy: "Main lift: 4 × 5. Build modestly while preserving the Week 1 depth, pauses, and bar path.",
      compound: { sets: 4, reps: [5, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    3: {
      kicker: "WEEK 3 · RPE 8",
      title: "Strength and specificity",
      copy: "Main lift: 4 × 3. Heavy, controlled work with one or two technically sound reps still available.",
      compound: { sets: 4, reps: [3, 3, 3, 3] },
      accessory: { sets: 3, reps: [8, 8, 8] },
    },
    4: {
      kicker: "WEEK 4 · RPE 9–10",
      title: "Peak and test",
      copy: "Use the seven-step warm-up ladder for the compound lift. Keep accessories short and stop if technique changes.",
      compound: { sets: 7, reps: [10, 5, 3, 1, 1, 1, 1] },
      accessory: { sets: 2, reps: [8, 8] },
    },
    5: {
      kicker: "WEEK 5 · RPE 5",
      title: "Deload and absorb the block",
      copy: "Main lift: 2 × 5 at roughly 50–55% of the tested max. Reduce accessories and arrive fresh for the 5 km benchmark.",
      compound: { sets: 2, reps: [5, 5] },
      accessory: { sets: 2, reps: [10, 10] },
    },
  };

  function safeRead(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function safeWrite(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function numberValue(input) {
    const value = Number(input?.value);
    return Number.isFinite(value) && input.value !== "" ? value : null;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  function initDashboard() {
    const root = document.getElementById("training-dashboard");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const storageKey = root.dataset.storageKey;
    const form = root.querySelector("#training-session-form");
    const cycleWeekSelect = root.querySelector("#training-cycle-week");
    const periodSelect = root.querySelector("#training-period");
    const templateSelect = root.querySelector("#training-template");
    const exerciseContainer = root.querySelector("#training-exercises");
    const historyContainer = root.querySelector("#training-history");
    const saveStatus = root.querySelector("#training-save-status");

    Object.entries(templates).forEach(([value, template]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = template.label;
      templateSelect.appendChild(option);
    });

    const today = new Date();
    const planStart = new Date("2026-09-14T12:00:00");
    const elapsedWeeks = Math.max(
      0,
      Math.floor((today.getTime() - planStart.getTime()) / 604800000),
    );
    cycleWeekSelect.value = String((elapsedWeeks % 5) + 1);
    periodSelect.value = today.getHours() < 14 ? "morning" : "evening";
    templateSelect.value = weeklySchedule[today.getDay()][periodSelect.value];
    root.querySelector("#training-date").textContent = new Intl.DateTimeFormat(
      "en-US",
      { weekday: "long", month: "long", day: "numeric" },
    ).format(today);

    function createSetRow(setNumber, fields, data = {}) {
      const row = document.createElement("div");
      row.className = "training-set-row";
      row.innerHTML = `
        <span class="training-set-number">${setNumber}</span>
        <label><span class="sr-only">${fields[0].label}</span><input data-field="${fields[0].key}" type="number" min="0" step="${fields[0].step}" inputmode="decimal" placeholder="${fields[0].placeholder}" value="${data[fields[0].key] ?? ""}"></label>
        <label><span class="sr-only">${fields[1].label}</span><input data-field="${fields[1].key}" type="number" min="0" step="${fields[1].step}" inputmode="decimal" placeholder="${fields[1].placeholder}" value="${data[fields[1].key] ?? ""}"></label>
        <label><span class="sr-only">RPE</span><input data-field="rpe" type="number" min="1" max="10" step="0.5" inputmode="decimal" placeholder="RPE" value="${data.rpe ?? ""}"></label>
        <button class="training-remove-set" type="button" aria-label="Remove set"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
      row
        .querySelector(".training-remove-set")
        .addEventListener("click", () => {
          const group = row.parentElement;
          row.remove();
          [...group.querySelectorAll(".training-set-number")].forEach(
            (element, index) => (element.textContent = index + 1),
          );
        });
      return row;
    }

    function exercisePrescription(exercise) {
      const week = programWeeks[cycleWeekSelect.value];
      if (exercise.mode === "strength") {
        const scheme =
          exercise.role === "compound" ? week.compound : week.accessory;
        const description =
          exercise.role === "compound"
            ? week.copy.replace("Main lift: ", "")
            : cycleWeekSelect.value === "4"
              ? "1–2 easy accessory sets · no failure before a PR attempt."
              : cycleWeekSelect.value === "5"
                ? "2 easy accessory sets · recovery is the objective."
                : `Accessory work · ${scheme.sets} sets · finish with 2–4 reps available.`;
        return { ...scheme, description };
      }
      const cardioCopy = {
        1: "Base week · comfortable aerobic work or short controlled intervals.",
        2: "Build week · add a little duration or one interval.",
        3: "Quality week · the strongest aerobic stimulus of the block.",
        4: "Peak week · reduce duration by roughly 35–40%.",
        5: "Deload week · easy movement, or the scheduled 5 km benchmark.",
      };
      return {
        sets: 1,
        reps: [],
        description:
          exercise.mode === "cardio"
            ? cardioCopy[cycleWeekSelect.value]
            : "Keep this restorative and pain-free.",
      };
    }

    function createExercise(exercise) {
      const { name, mode = "strength", baseline } = exercise;
      const fields = modeFields[mode];
      const prescription = exercisePrescription({ ...exercise, mode });
      const card = document.createElement("article");
      card.className = "training-exercise-card";
      card.dataset.exercise = name;
      card.dataset.mode = mode;
      card.dataset.role = exercise.role || "accessory";
      card.innerHTML = `
        <div class="training-exercise-heading">
          <div><span>EXERCISE</span><input class="training-exercise-name" value="${name}" aria-label="Exercise name"></div>
          <button class="training-add-set" type="button"><i class="fa-solid fa-plus" aria-hidden="true"></i> Set</button>
        </div>
        <p class="training-exercise-prescription">${prescription.description}${baseline ? ` <b>Baseline: ${baseline}.</b>` : ""}</p>
        <div class="training-set-labels" aria-hidden="true"><span>Set</span><span>${fields[0].label}</span><span>${fields[1].label}</span><span>RPE</span><span></span></div>
        <div class="training-set-list"></div>`;
      const list = card.querySelector(".training-set-list");
      for (let index = 1; index <= prescription.sets; index += 1) {
        const data =
          mode === "strength" ? { reps: prescription.reps[index - 1] } : {};
        list.appendChild(createSetRow(index, fields, data));
      }
      card.querySelector(".training-add-set").addEventListener("click", () => {
        list.appendChild(createSetRow(list.children.length + 1, fields));
      });
      return card;
    }

    function renderTemplate() {
      exerciseContainer.replaceChildren();
      templates[templateSelect.value].exercises.forEach((exercise) =>
        exerciseContainer.appendChild(createExercise(exercise)),
      );
    }

    function renderProgramFocus() {
      const week = programWeeks[cycleWeekSelect.value];
      root.querySelector("#training-cycle-kicker").textContent = week.kicker;
      root.querySelector("#training-cycle-title").textContent = week.title;
      root.querySelector("#training-cycle-copy").textContent = week.copy;
    }

    function collectExercises() {
      return [...exerciseContainer.querySelectorAll(".training-exercise-card")]
        .map((card) => {
          const fields = modeFields[card.dataset.mode];
          return {
            name: card.querySelector(".training-exercise-name").value.trim(),
            mode: card.dataset.mode,
            sets: [...card.querySelectorAll(".training-set-row")]
              .map((row) => ({
                [fields[0].key]: numberValue(
                  row.querySelector(`[data-field="${fields[0].key}"]`),
                ),
                [fields[1].key]: numberValue(
                  row.querySelector(`[data-field="${fields[1].key}"]`),
                ),
                rpe: numberValue(row.querySelector('[data-field="rpe"]')),
              }))
              .filter((set) =>
                Object.values(set).some((value) => value !== null),
              ),
          };
        })
        .filter((exercise) => exercise.name && exercise.sets.length);
    }

    function sessionVolume(session) {
      return session.exercises.reduce(
        (total, exercise) =>
          total +
          exercise.sets.reduce(
            (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
            0,
          ),
        0,
      );
    }

    function renderHistory() {
      const sessions = safeRead(storageKey);
      root.querySelector("#training-session-count").textContent =
        sessions.length;
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekVolume = sessions
        .filter((session) => new Date(session.created_at).getTime() >= weekAgo)
        .reduce((sum, session) => sum + sessionVolume(session), 0);
      root.querySelector("#training-week-volume").textContent =
        `${Math.round(weekVolume).toLocaleString()} kg`;
      const latestWeight = sessions.find(
        (session) => session.body_weight !== null,
      )?.body_weight;
      root.querySelector("#training-latest-weight").textContent = latestWeight
        ? `${latestWeight} kg`
        : "—";

      historyContainer.replaceChildren();
      if (!sessions.length) {
        historyContainer.innerHTML =
          '<div class="training-empty-state"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i><strong>No sessions yet</strong><span>Your first completed workout will appear here.</span></div>';
        return;
      }

      sessions.slice(0, 6).forEach((session) => {
        const item = document.createElement("article");
        item.className = "training-history-item";
        const setCount = session.exercises.reduce(
          (sum, exercise) => sum + exercise.sets.length,
          0,
        );
        item.innerHTML = `
          <time>${formatDate(session.date)}</time>
          <div><strong>${session.template_label}</strong><span>${session.cycle_week ? `W${session.cycle_week} · ` : ""}${session.period ? `${session.period === "morning" ? "AM" : "PM"} · ` : ""}${session.exercises.length} activities · ${setCount} entries</span></div>
          <div class="training-history-metric"><strong>${Math.round(sessionVolume(session)).toLocaleString()}</strong><span>kg volume</span></div>`;
        historyContainer.appendChild(item);
      });
    }

    periodSelect.addEventListener("change", () => {
      templateSelect.value = weeklySchedule[today.getDay()][periodSelect.value];
      renderTemplate();
    });
    cycleWeekSelect.addEventListener("change", () => {
      renderProgramFocus();
      renderTemplate();
    });
    templateSelect.addEventListener("change", renderTemplate);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const exercises = collectExercises();
      if (!exercises.length) {
        saveStatus.textContent = "Enter at least one completed set.";
        return;
      }
      const now = new Date();
      const session = {
        id: `${now.getTime()}`,
        created_at: now.toISOString(),
        date: now.toISOString().slice(0, 10),
        cycle_week: Number(cycleWeekSelect.value),
        period: periodSelect.value,
        template: templateSelect.value,
        template_label: templates[templateSelect.value].label,
        body_weight: numberValue(root.querySelector("#training-body-weight")),
        sleep_hours: numberValue(root.querySelector("#training-sleep")),
        readiness: numberValue(root.querySelector("#training-readiness")),
        plan: root.querySelector("#training-plan").value.trim(),
        duration_minutes: numberValue(root.querySelector("#training-duration")),
        session_rpe: numberValue(root.querySelector("#training-session-rpe")),
        notes: root.querySelector("#training-notes").value.trim(),
        exercises,
      };
      const sessions = safeRead(storageKey);
      sessions.unshift(session);
      safeWrite(storageKey, sessions);
      saveStatus.textContent = "Workout saved on this device.";
      renderHistory();
    });

    root.querySelector("#training-export").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(safeRead(storageKey), null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `training-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });

    root.querySelector("#training-clear").addEventListener("click", () => {
      if (!window.confirm("Delete every locally saved workout on this device?"))
        return;
      localStorage.removeItem(storageKey);
      saveStatus.textContent = "Local workout data cleared.";
      renderHistory();
    });

    renderProgramFocus();
    renderTemplate();
    renderHistory();
  }

  document.addEventListener("DOMContentLoaded", initDashboard);
  document.addEventListener("seamless:load", initDashboard);
  initDashboard();
})();
