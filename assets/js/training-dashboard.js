(function () {
  const templates = {
    walk: {
      label: "Light walk",
      exercises: [{ name: "Walk", mode: "cardio" }],
    },
    stretch: {
      label: "Stretch",
      exercises: [{ name: "Mobility / Stretching", mode: "mobility" }],
    },
    run: {
      label: "Run",
      exercises: [{ name: "Run", mode: "cardio" }],
    },
    bike: {
      label: "Bike",
      exercises: [{ name: "Cycling", mode: "cardio" }],
    },
    swim: {
      label: "Swim",
      exercises: [{ name: "Swimming", mode: "cardio" }],
    },
    legs: {
      label: "Legs · Squat focus",
      exercises: [
        { name: "ATG Back Squat", mode: "strength", role: "compound" },
        {
          name: "Bulgarian Split Squat / Dumbbell Lunge",
          mode: "strength",
          sets: 2,
          reps: 10,
          note: "Each leg",
        },
        { name: "Leg Extension · Quads", mode: "strength" },
        { name: "Leg Curl · Hamstrings", mode: "strength" },
        {
          name: "Hip Abductor + Adductor / Weighted Glute Bridge",
          mode: "strength",
        },
        { name: "Calf Raise", mode: "strength" },
      ],
    },
    chest_triceps: {
      label: "Bench · Chest · Triceps",
      exercises: [
        { name: "Bench Press", mode: "strength", role: "compound" },
        { name: "Incline Dumbbell Press", mode: "strength" },
        { name: "Seated Pec Fly · Machine", mode: "strength" },
        { name: "Triceps Pushdown", mode: "strength" },
        {
          name: "Seated Dumbbell Overhead Triceps Extension",
          mode: "strength",
        },
        { name: "Dumbbell Pullover", mode: "strength" },
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
          baseline: "16 kg per hand × 10 easy",
        },
        { name: "Lateral Raise", mode: "strength" },
        { name: "Cable Upright Row", mode: "strength" },
        { name: "Seated Rear-Delt Fly · Machine", mode: "strength" },
        { name: "Reverse Cable Curl", mode: "strength" },
        { name: "Hammer Curl", mode: "strength" },
        { name: "Wrist Curl", mode: "strength" },
      ],
    },
    deadlift: {
      label: "Deadlift · Back · Grip",
      exercises: [
        { name: "Deadlift", mode: "strength", role: "compound" },
        { name: "Lat Pulldown", mode: "strength" },
        { name: "Seated Cable Row / Machine Row", mode: "strength" },
        { name: "Dumbbell Row", mode: "strength" },
        { name: "Weighted Back Extension · Hyperextension", mode: "strength" },
        { name: "Shrug · Optional", mode: "strength", sets: 3, reps: 10 },
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
    { morning: "walk", evening: "legs" },
    { morning: "walk", evening: "chest_triceps" },
    { morning: "run", evening: "shoulders_forearms" },
    { morning: "walk", evening: "bike" },
    { morning: "walk", evening: "deadlift" },
    { morning: "run", evening: "bike" },
  ];

  // Morning supports mobility, recovery, and aerobic work only. Strength
  // templates are available exclusively in the evening session picker.
  const templatesByPeriod = {
    morning: ["walk", "stretch", "run", "bike", "swim", "rest"],
    evening: [
      "legs",
      "chest_triceps",
      "shoulders_forearms",
      "run",
      "bike",
      "swim",
      "deadlift",
      "rest",
      "custom",
    ],
  };

  const modeFields = {
    strength: [
      { key: "weight", label: "Weight", placeholder: "lb", step: "0.1" },
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
    0: {
      kicker: "WEEK 0 · RPE 5",
      title: "Deload and absorb the block",
      copy: "Light warm-up: bar × 10, 30% × 5, 40% × 3; then 3 × 5 at 50–55%. Keep the three accessory sets light and arrive fresh for the next wave.",
      compound: { sets: 6, reps: [10, 5, 3, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    1: {
      kicker: "WEEK 1 · RPE 6",
      title: "Technique and repeatability",
      copy: "Warm up: bar × 10, 30% × 5, 40% × 3, then three ascending singles. After the top single, complete 3 × 5 at about 70%—four good reps still available.",
      compound: { sets: 9, reps: [10, 5, 3, 1, 1, 1, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    2: {
      kicker: "WEEK 2 · RPE 7",
      title: "Add load without changing the lift",
      copy: "Warm up: bar × 10, 30% × 5, 40% × 3, then three ascending singles. After the top single, complete 3 × 5 at about 72.5%.",
      compound: { sets: 9, reps: [10, 5, 3, 1, 1, 1, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    3: {
      kicker: "WEEK 3 · RPE 8",
      title: "Strength and specificity",
      copy: "Warm up: bar × 10, 30% × 5, 40% × 3, then three ascending singles. After the top single, complete 3 × 5 at about 75%.",
      compound: { sets: 9, reps: [10, 5, 3, 1, 1, 1, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
    4: {
      kicker: "WEEK 4 · RPE 9–10",
      title: "Peak and test",
      copy: "Use the seven-step warm-up ladder for the compound lift. After the top single or PR attempt, complete 3 × 5 at about 70% if form is stable. Keep all three accessory sets light and stop if technique changes.",
      compound: { sets: 10, reps: [10, 5, 3, 1, 1, 1, 1, 5, 5, 5] },
      accessory: { sets: 3, reps: [10, 10, 10] },
    },
  };

  // Calendar targets from the public September–December roadmap. These are
  // editable suggestions, not a command to force a lift on a bad day.
  const compoundTargetsByWeek = [
    { squat: 50, bench: 35, overhead: 22.5, deadlift: 70 },
    { squat: 60, bench: 42.5, overhead: 27.5, deadlift: 80 },
    { squat: 67.5, bench: 47.5, overhead: 30, deadlift: 90 },
    { squat: 77.5, bench: 55, overhead: 35, deadlift: 105 },
    { squat: 100, bench: 70, overhead: 45, deadlift: 135 },
    { squat: 55, bench: 37.5, overhead: 25, deadlift: 75 },
    { squat: 65, bench: 45, overhead: 30, deadlift: 85 },
    { squat: 75, bench: 50, overhead: 35, deadlift: 95 },
    { squat: 85, bench: 57.5, overhead: 40, deadlift: 110 },
    { squat: 110, bench: 75, overhead: 50, deadlift: 142.5 },
    { squat: 60, bench: 40, overhead: 27.5, deadlift: 77.5 },
    { squat: 72.5, bench: 47.5, overhead: 32.5, deadlift: 90 },
    { squat: 80, bench: 55, overhead: 37.5, deadlift: 100 },
    { squat: 92.5, bench: 62.5, overhead: 42.5, deadlift: 115 },
    { squat: 120, bench: 80, overhead: 55, deadlift: 150 },
    { squat: 65, bench: 45, overhead: 30, deadlift: 82.5 },
  ];

  const compoundTargetKeyByTemplate = {
    legs: "squat",
    chest_triceps: "bench",
    shoulders_forearms: "overhead",
    deadlift: "deadlift",
  };

  function roundToPlates(weight) {
    return Math.round(weight / 2.5) * 2.5;
  }

  const runningPlanByWeek = {
    0: {
      summary:
        "Wed easy 25 min · Sat easy 25–30 min · Sun easy long 35–40 min. Test 5 km only if your legs are recovered.",
      easy: "Deload easy run · 25–40 min, fully conversational.",
      fartlek: "Not scheduled in deload. Choose an easy run instead.",
      intervals: "Not scheduled in deload. Choose an easy run instead.",
      tempo: "Not scheduled in deload. Choose an easy run instead.",
      threshold: "Not scheduled in deload. Choose an easy run instead.",
      long: "Deload long run · 35–40 min, fully conversational.",
      benchmark:
        "5 km benchmark only if legs feel recovered; otherwise move it to the following Sunday.",
    },
    1: {
      summary:
        "Wed fartlek 8 × 1 min quick / 90 s easy · Sat tempo 2 × 8 min / 3 min easy · Sun long 45 min.",
      easy: "Easy recovery run · 25–35 min, conversational.",
      fartlek: "8 × 1 min quick with 90 s easy jog or walk between efforts.",
      intervals:
        "Use the scheduled fartlek this week; keep any intervals short and controlled.",
      tempo: "2 × 8 min steady tempo with 3 min easy between blocks.",
      threshold:
        "Use the scheduled tempo this week; threshold work begins in Week 3.",
      long: "Easy long run · 45 min, conversational throughout.",
      benchmark: "No 5 km test this week—save it for a deload week.",
    },
    2: {
      summary:
        "Wed 6 × 2 min at 5 km effort / 2 min easy · Sat continuous tempo 20 min · Sun long 50 min.",
      easy: "Easy recovery run · 25–35 min, conversational.",
      fartlek: "Optional alternative: 8 × 1 min quick with 90 s easy.",
      intervals:
        "6 × 2 min at current 5 km effort with 2 min easy jog between reps.",
      tempo: "Continuous tempo · 20 min steady and controlled.",
      threshold:
        "Use the scheduled tempo this week; threshold work begins in Week 3.",
      long: "Easy long run · 50 min, conversational throughout.",
      benchmark: "No 5 km test this week—save it for a deload week.",
    },
    3: {
      summary:
        "Wed 5 × 3 min at 5 km effort / 2 min jog · Sat threshold 3 × 8 min / 2 min easy · Sun long 55 min.",
      easy: "Easy recovery run · 25–35 min, conversational.",
      fartlek: "Optional alternative: 6–8 × 1 min quick with 90 s easy.",
      intervals:
        "5 × 3 min at current 5 km effort with 2 min easy jog between reps.",
      tempo: "Optional alternative: 20 min steady tempo, not a race.",
      threshold:
        "3 × 8 min at threshold effort with 2 min easy between blocks.",
      long: "Easy long run · 55 min, conversational throughout.",
      benchmark: "No 5 km test this week—save it for a deload week.",
    },
    4: {
      summary:
        "Wed 6 × 1 min quick / 90 s easy · Sat controlled tempo 15 min · Sun easy long 40–45 min.",
      easy: "Easy recovery run · 20–30 min, conversational.",
      fartlek: "6 × 1 min quick with 90 s easy jog or walk between efforts.",
      intervals:
        "Keep it short: 6 × 1 min quick with 90 s easy; do not chase fatigue.",
      tempo:
        "Controlled tempo · 15 min. Finish feeling like you could do more.",
      threshold:
        "Use the shorter tempo this peak week instead of threshold work.",
      long: "Easy long run · 40–45 min, conversational throughout.",
      benchmark: "No 5 km test this week—protect the peak lifts.",
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
    const weightUnitSelect = root.querySelector("#training-weight-unit");
    const bodyWeightInput = root.querySelector("#training-body-weight");
    const runTypeField = root.querySelector("#training-run-type-field");
    const runTypeSelect = root.querySelector("#training-run-type");
    const exerciseContainer = root.querySelector("#training-exercises");
    const extraExerciseModeSelect = root.querySelector(
      "#training-extra-exercise-mode",
    );
    const addExerciseButton = root.querySelector("#training-add-exercise");
    const historyContainer = root.querySelector("#training-history");
    const saveStatus = root.querySelector("#training-save-status");
    const weekStrength = root.querySelector("#training-week-strength");
    const weekRunning = root.querySelector("#training-week-running");
    const weekSchedule = root.querySelector("#training-week-schedule");
    const showAllButton = root.querySelector("#training-show-all");
    const editingSessionId = new URLSearchParams(window.location.search).get(
      "edit",
    );
    let weightUnit = weightUnitSelect.value || "lb";
    let showingAllSessions = false;
    let sessionDateForContext = new Date();
    let editSessionLoaded = false;

    const kilogramsPerPound = 0.45359237;
    const roundWeight = (value) => Math.round(value * 10) / 10;
    const toKilograms = (value, unit) =>
      unit === "lb" ? value * kilogramsPerPound : value;
    const fromKilograms = (value, unit) =>
      unit === "lb" ? value / kilogramsPerPound : value;
    const displayWeight = (value) =>
      Number.isFinite(value) ? `${roundWeight(value)}` : "";

    function fieldsForMode(mode) {
      return modeFields[mode].map((field) =>
        field.key === "weight"
          ? {
              ...field,
              label: `Weight (${weightUnit})`,
              placeholder: weightUnit,
              step: "0.1",
            }
          : field,
      );
    }

    function setWeightUnit(nextUnit, convertExisting = true) {
      const previousUnit = weightUnit;
      weightUnit = nextUnit;
      root.querySelector("#training-body-weight-unit").textContent = nextUnit;
      if (convertExisting && previousUnit !== nextUnit) {
        root
          .querySelectorAll('.training-exercise-card[data-mode="strength"] [data-field="weight"]')
          .forEach((input) => {
            const value = numberValue(input);
            if (value !== null)
              input.value = displayWeight(
                fromKilograms(toKilograms(value, previousUnit), nextUnit),
              );
            input.placeholder = nextUnit;
          });
        const bodyWeight = numberValue(bodyWeightInput);
        if (bodyWeight !== null)
          bodyWeightInput.value = displayWeight(
            fromKilograms(toKilograms(bodyWeight, previousUnit), nextUnit),
          );
      }
      root.querySelectorAll(".training-set-labels").forEach((labels) => {
        const weightLabel = labels.children[1];
        if (weightLabel) weightLabel.textContent = `Weight (${nextUnit})`;
      });
    }

    function populateTemplateOptions(period, selectedTemplate) {
      const availableTemplates = templatesByPeriod[period];
      templateSelect.replaceChildren();
      availableTemplates.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = templates[value].label;
        templateSelect.appendChild(option);
      });
      templateSelect.value = availableTemplates.includes(selectedTemplate)
        ? selectedTemplate
        : availableTemplates[0];
    }

    const today = new Date();
    const planStart = new Date("2026-09-21T12:00:00");
    const elapsedWeeks = Math.floor(
      (today.getTime() - planStart.getTime()) / 604800000,
    );
    const cycleSequence = ["0", "1", "2", "3", "4"];
    const programWeekIndex = Math.max(0, elapsedWeeks);
    cycleWeekSelect.value =
      elapsedWeeks < 0
        ? "4"
        : cycleSequence[elapsedWeeks % cycleSequence.length];
    periodSelect.value = today.getHours() < 14 ? "morning" : "evening";
    populateTemplateOptions(
      periodSelect.value,
      weeklySchedule[today.getDay()][periodSelect.value],
    );
    root.querySelector("#training-date").textContent = new Intl.DateTimeFormat(
      "en-US",
      { weekday: "long", month: "long", day: "numeric" },
    ).format(today);
    bodyWeightInput.value = displayWeight(
      fromKilograms(Number(bodyWeightInput.dataset.defaultKg || 82), weightUnit),
    );

    function createSetRow(setNumber, fields, data = {}, options = {}) {
      const row = document.createElement("div");
      row.className = "training-set-row";
      const firstField = options.emptyBar
        ? '<span class="training-empty-bar">Empty bar</span>'
        : `<label><span class="sr-only">${fields[0].label}</span><input data-field="${fields[0].key}" type="number" min="0" step="${fields[0].step}" inputmode="decimal" placeholder="${fields[0].placeholder}" value="${data[fields[0].key] ?? ""}"></label>`;
      row.innerHTML = `
        <span class="training-set-number">${setNumber}</span>
        ${firstField}
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
        const baseScheme =
          exercise.role === "compound" ? week.compound : week.accessory;
        const scheme =
          exercise.role === "compound"
            ? baseScheme
            : {
                sets: exercise.sets ?? baseScheme.sets,
                reps: Array.from(
                  { length: exercise.sets ?? baseScheme.sets },
                  () => exercise.reps ?? baseScheme.reps[0],
                ),
              };
        const description =
          exercise.role === "compound"
            ? week.copy
            : cycleWeekSelect.value === "4"
              ? `${scheme.sets} light accessory sets · no failure before a PR attempt.`
              : cycleWeekSelect.value === "0"
                ? `${scheme.sets} easy accessory sets · recovery is the objective.`
                : `Accessory work · ${scheme.sets} sets of ${exercise.reps ?? "10–12"} · finish with 2–4 reps available.`;
        return {
          ...scheme,
          weights: exercise.weights,
          description: `${description}${exercise.note ? ` ${exercise.note}.` : ""}`,
        };
      }
      const cardioCopy = {
        1: "Base week · comfortable aerobic work or short controlled intervals.",
        2: "Build week · add a little duration or one interval.",
        3: "Quality week · the strongest aerobic stimulus of the block.",
        4: "Peak week · reduce duration by roughly 35–40%.",
        0: "Deload week · easy movement, recovery cycling, or the scheduled 5 km benchmark.",
      };
      const runPrescription =
        exercise.runType &&
        runningPlanByWeek[cycleWeekSelect.value][exercise.runType];
      return {
        sets: exercise.sets ?? 1,
        reps: [],
        description:
          exercise.runDescription ||
          runPrescription ||
          (exercise.mode === "cardio"
            ? cardioCopy[cycleWeekSelect.value]
            : "Keep this restorative and pain-free."),
      };
    }

    function createExercise(exercise) {
      const { name, mode = "strength", baseline } = exercise;
      const fields = fieldsForMode(mode);
      const recordedSets = Array.isArray(exercise.recordedSets)
        ? exercise.recordedSets
        : null;
      const prescription = recordedSets
        ? {
            sets: recordedSets.length,
            reps: recordedSets.map((set) => set.reps),
            weights: recordedSets.map((set) => set.weight),
            description: "Recorded session — edit any field, then save to update it.",
          }
        : exercisePrescription({ ...exercise, mode });
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
        <div class="training-set-list"></div>
        <label class="training-exercise-note">Exercise note <textarea rows="2" placeholder="Technique, pain, progression, or anything to remember next time."></textarea></label>
        <p class="training-previous-exercise" hidden></p>`;
      const list = card.querySelector(".training-set-list");
      for (let index = 1; index <= prescription.sets; index += 1) {
        const sourceSet = recordedSets?.[index - 1];
        const data = sourceSet
          ? {
              ...sourceSet,
              weight:
                mode === "strength" && sourceSet.weight !== null
                  ? displayWeight(
                      fromKilograms(
                        toKilograms(
                          sourceSet.weight,
                          exercise.recordedWeightUnit || "kg",
                        ),
                        weightUnit,
                      ),
                    )
                  : sourceSet.weight,
            }
          : mode === "strength"
            ? {
                reps: prescription.reps[index - 1],
                weight:
                  prescription.weights?.[index - 1] === undefined
                    ? undefined
                    : displayWeight(
                        fromKilograms(
                          prescription.weights[index - 1],
                          weightUnit,
                        ),
                      ),
              }
            : {
                duration: exercise.duration,
                distance: exercise.distance,
                rpe: exercise.rpe,
              };
        list.appendChild(
          createSetRow(index, fields, data, {
            emptyBar:
              mode === "strength" &&
              exercise.role === "compound" &&
              index === 1,
          }),
        );
      }
      card.querySelector(".training-add-set").addEventListener("click", () => {
        list.appendChild(createSetRow(list.children.length + 1, fields));
      });
      card.querySelector(".training-exercise-note textarea").value =
        exercise.recordedNote || "";
      renderPreviousExercise(card, name);
      return card;
    }

    function renderPreviousExercise(card, name) {
      const previous = safeRead(storageKey).find((session) => {
        if (String(session.id) === String(editingSessionId)) return false;
        if (session.template !== templateSelect.value) return false;
        const sessionDay = new Date(`${session.date}T12:00:00`).getDay();
        if (sessionDay !== sessionDateForContext.getDay()) return false;
        const exercise = session.exercises?.find(
          (item) => item.name?.toLowerCase() === name.toLowerCase(),
        );
        return Boolean(exercise);
      });
      if (!previous) return;
      const exercise = previous.exercises.find(
        (item) => item.name?.toLowerCase() === name.toLowerCase(),
      );
      const summary = card.querySelector(".training-previous-exercise");
      const unit = previous.weight_unit || "kg";
      const usefulSet = exercise.sets?.find(
        (set) => set.weight !== null || set.duration !== null,
      );
      const pieces = [];
      if (usefulSet?.weight !== null && usefulSet?.weight !== undefined)
        pieces.push(`${usefulSet.weight} ${unit} × ${usefulSet.reps || "?"}`);
      else if (usefulSet?.duration !== null && usefulSet?.duration !== undefined)
        pieces.push(`${usefulSet.duration} min`);
      if (usefulSet?.rpe !== null && usefulSet?.rpe !== undefined)
        pieces.push(`RPE ${usefulSet.rpe}`);
      if (exercise.note) pieces.push(exercise.note);
      summary.textContent = `Previous ${formatDate(previous.date)} · ${
        pieces.join(" · ") || "recorded"
      }`;
      summary.hidden = false;
    }

    function compoundWeightPlan(topWeight) {
      const cycleWeek = cycleWeekSelect.value;
      if (cycleWeek === "0") {
        return [
          undefined,
          roundToPlates(topWeight * 0.6),
          roundToPlates(topWeight * 0.8),
          topWeight,
          topWeight,
          topWeight,
        ];
      }
      if (cycleWeek === "4") {
        return [
          undefined,
          roundToPlates(topWeight * 0.5),
          roundToPlates(topWeight * 0.65),
          roundToPlates(topWeight * 0.75),
          roundToPlates(topWeight * 0.875),
          roundToPlates(topWeight * 0.95),
          topWeight,
          roundToPlates(topWeight * 0.7),
          roundToPlates(topWeight * 0.7),
          roundToPlates(topWeight * 0.7),
        ];
      }
      const backoffRatio = { 1: 0.7, 2: 0.725, 3: 0.75 }[cycleWeek];
      return [
        undefined,
        roundToPlates(topWeight * 0.3),
        roundToPlates(topWeight * 0.4),
        roundToPlates(topWeight * 0.5),
        roundToPlates(topWeight * 0.6),
        roundToPlates(topWeight * 0.7),
        roundToPlates(topWeight * backoffRatio),
        roundToPlates(topWeight * backoffRatio),
        roundToPlates(topWeight * backoffRatio),
      ];
    }

    function runSessionExercises(runType) {
      const week = cycleWeekSelect.value;
      const cardio = (name, sets, duration, rpe, runDescription, distance) => ({
        name,
        mode: "cardio",
        sets,
        duration,
        distance,
        rpe,
        runDescription,
      });
      const warmup = cardio(
        "Easy jog warm-up",
        1,
        10,
        3,
        "Easy jog plus a few drills before the quality work.",
      );
      const cooldown = cardio(
        "Easy jog cooldown",
        1,
        10,
        2,
        "Easy downshift; finish with the cooldown and stretch checklist.",
      );

      if (runType === "easy") {
        const duration = { 0: 25, 1: 30, 2: 30, 3: 30, 4: 25 }[week];
        return [
          cardio("Easy Run", 1, duration, 4, runningPlanByWeek[week].easy),
        ];
      }
      if (runType === "long") {
        const duration = { 0: 38, 1: 45, 2: 50, 3: 55, 4: 43 }[week];
        return [
          cardio("Long Easy Run", 1, duration, 4, runningPlanByWeek[week].long),
        ];
      }
      if (runType === "benchmark") {
        return [
          warmup,
          cardio(
            "5 km Benchmark",
            1,
            undefined,
            9,
            runningPlanByWeek[week].benchmark,
            5,
          ),
          cooldown,
        ];
      }
      if (runType === "fartlek") {
        const reps = week === "4" ? 6 : 8;
        return [
          warmup,
          cardio(
            "Quick Fartlek Rep",
            reps,
            1,
            7,
            runningPlanByWeek[week].fartlek,
          ),
          cardio(
            "Easy Recovery",
            reps,
            1.5,
            3,
            "Jog or walk easily between quick reps.",
          ),
          cooldown,
        ];
      }
      if (runType === "intervals") {
        const isWeek3 = week === "3";
        const reps = isWeek3 ? 5 : 6;
        const work = isWeek3 ? 3 : 2;
        return [
          warmup,
          cardio(
            "5 km-Effort Interval",
            reps,
            work,
            8,
            runningPlanByWeek[week].intervals,
          ),
          cardio(
            "Easy Jog Recovery",
            reps,
            2,
            3,
            "Easy jog between interval reps.",
          ),
          cooldown,
        ];
      }
      if (runType === "tempo") {
        const isWeek1 = week === "1";
        const duration = isWeek1 ? 8 : week === "4" ? 15 : 20;
        const sets = isWeek1 ? 2 : 1;
        return [
          warmup,
          cardio(
            "Tempo Block",
            sets,
            duration,
            7,
            runningPlanByWeek[week].tempo,
          ),
          ...(isWeek1
            ? [
                cardio(
                  "Easy Recovery",
                  2,
                  3,
                  3,
                  "Easy jog between tempo blocks.",
                ),
              ]
            : []),
          cooldown,
        ];
      }
      const sets = week === "3" ? 3 : 2;
      const duration = week === "3" ? 8 : 8;
      return [
        warmup,
        cardio(
          "Threshold Block",
          sets,
          duration,
          7.5,
          runningPlanByWeek[week].threshold,
        ),
        cardio(
          "Easy Recovery",
          sets,
          2,
          3,
          "Easy jog between threshold blocks.",
        ),
        cooldown,
      ];
    }

    function renderTemplate() {
      exerciseContainer.replaceChildren();
      const isRun = templateSelect.value === "run";
      runTypeField.hidden = !isRun;
      runTypeField.classList.toggle("is-visible", isRun);
      const exercises = isRun
        ? runSessionExercises(runTypeSelect.value)
        : templates[templateSelect.value].exercises;
      const targetKey = compoundTargetKeyByTemplate[templateSelect.value];
      const topWeight = targetKey
        ? compoundTargetsByWeek[
            Math.min(programWeekIndex, compoundTargetsByWeek.length - 1)
          ][targetKey]
        : undefined;
      exercises.forEach((exercise) => {
        const prescribedExercise =
          exercise.role === "compound" && topWeight
            ? { ...exercise, weights: compoundWeightPlan(topWeight) }
            : exercise;
        exerciseContainer.appendChild(createExercise(prescribedExercise));
      });
    }

    function loadSessionForEdit(session) {
      if (!session) return;
      editSessionLoaded = true;
      sessionDateForContext = new Date(`${session.date}T12:00:00`);
      const savedUnit = session.weight_unit || "kg";
      weightUnitSelect.value = savedUnit;
      setWeightUnit(savedUnit, false);
      cycleWeekSelect.value = String(session.cycle_week ?? 0);
      periodSelect.value = session.period || "evening";
      populateTemplateOptions(periodSelect.value, session.template);
      templateSelect.value = session.template;
      runTypeSelect.value = session.run_type || "easy";
      runTypeField.hidden = templateSelect.value !== "run";
      runTypeField.classList.toggle("is-visible", templateSelect.value === "run");
      bodyWeightInput.value =
        session.body_weight === null || session.body_weight === undefined
          ? ""
          : displayWeight(
              fromKilograms(
                toKilograms(
                  session.body_weight,
                  session.body_weight_unit || savedUnit,
                ),
                savedUnit,
              ),
            );
      root.querySelector("#training-sleep").value = session.sleep_hours ?? "";
      root.querySelector("#training-readiness").value = session.readiness ?? "";
      root.querySelector("#training-warmup-complete").checked = Boolean(
        session.warmup_completed,
      );
      root.querySelector("#training-cooldown-complete").checked = Boolean(
        session.cooldown_completed,
      );
      root.querySelector("#training-plan").value = session.plan || "";
      root.querySelector("#training-duration").value = session.duration_minutes ?? "";
      root.querySelector("#training-session-rpe").value = session.session_rpe ?? "";
      root.querySelector("#training-notes").value = session.notes || "";
      exerciseContainer.replaceChildren();
      session.exercises.forEach((exercise) =>
        exerciseContainer.appendChild(
          createExercise({
            ...exercise,
            recordedSets: exercise.sets,
            recordedWeightUnit: savedUnit,
            recordedNote: exercise.note,
          }),
        ),
      );
      root.querySelector(".training-save-button").innerHTML =
        '<i class="fa-solid fa-pen" aria-hidden="true"></i> Update workout';
      saveStatus.textContent = "Editing saved session. Update when you are done.";
    }

    function addExtraExercise() {
      const mode = extraExerciseModeSelect.value;
      const names = {
        strength: "Additional strength exercise",
        cardio: "Additional cardio activity",
        mobility: "Additional mobility work",
      };
      const card = createExercise({ name: names[mode], mode });
      exerciseContainer.appendChild(card);
      card.querySelector(".training-exercise-name").focus();
      card.querySelector(".training-exercise-name").select();
    }

    function renderProgramFocus() {
      const week = programWeeks[cycleWeekSelect.value];
      root.querySelector("#training-cycle-kicker").textContent = week.kicker;
      root.querySelector("#training-cycle-title").textContent = week.title;
      root.querySelector("#training-cycle-copy").textContent = week.copy;
    }

    function renderWeeklyPlan() {
      const week = programWeeks[cycleWeekSelect.value];
      const running = runningPlanByWeek[cycleWeekSelect.value];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      weekStrength.textContent = `Compound lifts · ${week.copy}`;
      weekRunning.textContent = `Running plan · ${running.summary}`;
      weekSchedule.replaceChildren();
      weeklySchedule.forEach((day, index) => {
        const item = document.createElement("div");
        item.innerHTML = `<strong>${days[index]}</strong><span>AM · ${templates[day.morning].label}</span><span>PM · ${templates[day.evening].label}</span>`;
        weekSchedule.appendChild(item);
      });
    }

    function collectExercises() {
      return [...exerciseContainer.querySelectorAll(".training-exercise-card")]
        .map((card) => {
          const fields = fieldsForMode(card.dataset.mode);
          return {
            name: card.querySelector(".training-exercise-name").value.trim(),
            mode: card.dataset.mode,
            note: card
              .querySelector(".training-exercise-note textarea")
              .value.trim(),
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
      const unit = session.weight_unit || "kg";
      return session.exercises.reduce(
        (total, exercise) =>
          total +
          exercise.sets.reduce(
            (sum, set) =>
              sum +
              toKilograms(set.weight || 0, unit) * (set.reps || 0),
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
      const latestSessionWithWeight = sessions.find(
        (session) => session.body_weight !== null,
      );
      const latestWeight = latestSessionWithWeight?.body_weight;
      root.querySelector("#training-latest-weight").textContent = latestWeight
        ? `${latestWeight} ${latestSessionWithWeight.body_weight_unit || latestSessionWithWeight.weight_unit || "kg"}`
        : "—";

      historyContainer.replaceChildren();
      if (!sessions.length) {
        historyContainer.innerHTML =
          '<div class="training-empty-state"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i><strong>No sessions yet</strong><span>Your first completed workout will appear here.</span></div>';
        return;
      }

      showAllButton.hidden = false;
      showAllButton.disabled = sessions.length <= 6;
      showAllButton.textContent = showingAllSessions
        ? "Show recent sessions"
        : sessions.length <= 6
          ? `Showing all ${sessions.length} sessions`
          : `Show all ${sessions.length} sessions`;
      (showingAllSessions ? sessions : sessions.slice(0, 6)).forEach(
        (session) => {
          const item = document.createElement("article");
          item.className = "training-history-item";
          const setCount = session.exercises.reduce(
            (sum, exercise) => sum + exercise.sets.length,
            0,
          );
          item.innerHTML = `
          <time>${formatDate(session.date)}</time>
          <div><strong>${session.template_label}</strong><span>${session.cycle_week !== undefined && session.cycle_week !== null ? `W${session.cycle_week} · ` : ""}${session.period ? `${session.period === "morning" ? "AM" : "PM"} · ` : ""}${session.exercises.length} activities · ${setCount} entries</span></div>
          <div class="training-history-metric"><strong>${Math.round(sessionVolume(session)).toLocaleString()}</strong><span>kg volume</span></div>
          <a class="training-session-link" href="/training/session/?id=${encodeURIComponent(session.id)}">View</a>`;
          historyContainer.appendChild(item);
        },
      );
    }

    periodSelect.addEventListener("change", () => {
      populateTemplateOptions(
        periodSelect.value,
        weeklySchedule[today.getDay()][periodSelect.value],
      );
      renderTemplate();
    });
    weightUnitSelect.addEventListener("change", () =>
      setWeightUnit(weightUnitSelect.value),
    );
    cycleWeekSelect.addEventListener("change", () => {
      renderProgramFocus();
      renderWeeklyPlan();
      renderTemplate();
    });
    templateSelect.addEventListener("change", renderTemplate);
    runTypeSelect.addEventListener("change", renderTemplate);
    addExerciseButton.addEventListener("click", addExtraExercise);
    const poundsInput = root.querySelector("#training-pounds");
    const kilogramsInput = root.querySelector("#training-kilograms");
    poundsInput.addEventListener("input", () => {
      const pounds = numberValue(poundsInput);
      kilogramsInput.value =
        pounds === null ? "" : (pounds * 0.45359237).toFixed(1);
    });
    kilogramsInput.addEventListener("input", () => {
      const kilograms = numberValue(kilogramsInput);
      poundsInput.value =
        kilograms === null ? "" : (kilograms / 0.45359237).toFixed(1);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const exercises = collectExercises();
      if (!exercises.length) {
        saveStatus.textContent = "Enter at least one completed set.";
        return;
      }
      const now = new Date();
      const savedSessions = safeRead(storageKey);
      const existingSession = editingSessionId
        ? savedSessions.find((session) => session.id === editingSessionId)
        : null;
      const session = {
        id: existingSession?.id || `${now.getTime()}`,
        created_at: existingSession?.created_at || now.toISOString(),
        updated_at: now.toISOString(),
        date: existingSession?.date || now.toISOString().slice(0, 10),
        cycle_week: Number(cycleWeekSelect.value),
        period: periodSelect.value,
        template: templateSelect.value,
        template_label: templates[templateSelect.value].label,
        weight_unit: weightUnit,
        body_weight: numberValue(root.querySelector("#training-body-weight")),
        body_weight_unit: weightUnit,
        sleep_hours: numberValue(root.querySelector("#training-sleep")),
        readiness: numberValue(root.querySelector("#training-readiness")),
        warmup_completed: root.querySelector("#training-warmup-complete")
          .checked,
        cooldown_completed: root.querySelector("#training-cooldown-complete")
          .checked,
        plan: root.querySelector("#training-plan").value.trim(),
        duration_minutes: numberValue(root.querySelector("#training-duration")),
        session_rpe: numberValue(root.querySelector("#training-session-rpe")),
        notes: root.querySelector("#training-notes").value.trim(),
        run_type: templateSelect.value === "run" ? runTypeSelect.value : null,
        exercises,
      };
      const sessions = existingSession
        ? savedSessions.map((item) => (item.id === session.id ? session : item))
        : [session, ...savedSessions];
      safeWrite(storageKey, sessions);
      saveStatus.textContent = existingSession
        ? "Workout updated. Syncing your private copy…"
        : "Workout saved. Syncing your private copy…";
      window.dispatchEvent(
        new CustomEvent("training:session-saved", { detail: session }),
      );
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

    showAllButton.addEventListener("click", () => {
      showingAllSessions = !showingAllSessions;
      renderHistory();
    });

    root.querySelector("#training-clear").addEventListener("click", () => {
      if (!window.confirm("Delete every locally saved workout on this device?"))
        return;
      localStorage.removeItem(storageKey);
      saveStatus.textContent = "Local workout data cleared.";
      renderHistory();
    });

    renderProgramFocus();
    renderWeeklyPlan();
    renderTemplate();
    if (editingSessionId)
      loadSessionForEdit(
        safeRead(storageKey).find((session) => session.id === editingSessionId),
      );
    renderHistory();
    window.addEventListener("training:cloud-synced", () => {
      if (editingSessionId && !editSessionLoaded) {
        loadSessionForEdit(
          safeRead(storageKey).find(
            (session) => String(session.id) === String(editingSessionId),
          ),
        );
      }
      renderHistory();
    });
  }

  document.addEventListener("DOMContentLoaded", initDashboard);
  document.addEventListener("seamless:load", initDashboard);
  initDashboard();
})();
