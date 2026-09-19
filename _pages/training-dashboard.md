---
layout: default
title: Training Dashboard
permalink: /training/dashboard/
description: A private-on-this-device workout and recovery log.
nav: false
---

<div id="training-dashboard" class="training-dashboard" data-storage-key="ht-training-sessions-v1">
  <header class="training-dashboard-header">
    <div>
      <p class="training-eyebrow">PRIVATE · ON THIS DEVICE</p>
      <h1>Today’s training</h1>
      <p id="training-date" class="training-dashboard-date"></p>
    </div>
    <a class="training-back-link" href="/training/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Public overview</a>
  </header>

  <div class="training-local-notice" role="note">
    <i class="fa-solid fa-laptop" aria-hidden="true"></i>
    <div><strong>Local private mode</strong><span>Your entries stay in this browser. They are not uploaded to the website or committed to GitHub.</span></div>
  </div>

  <section class="training-summary-grid" aria-label="Training summary">
    <article><span>Saved sessions</span><strong id="training-session-count">0</strong></article>
    <article><span>Seven-day volume</span><strong id="training-week-volume">0 kg</strong></article>
    <article><span>Latest body weight</span><strong id="training-latest-weight">—</strong></article>
  </section>

  <form id="training-session-form" class="training-session-form">
    <section class="training-panel training-session-setup">
      <div class="training-panel-heading">
        <div><span>01</span><h2>Session setup</h2></div>
        <p>Choose a template, then adjust anything you need.</p>
      </div>
      <div class="training-input-grid">
        <label>Cycle week
          <select id="training-cycle-week" name="cycle_week">
            <option value="0">Week 0 · Deload</option>
            <option value="1">Week 1 · RPE 6</option>
            <option value="2">Week 2 · RPE 7</option>
            <option value="3">Week 3 · RPE 8</option>
            <option value="4">Week 4 · Peak</option>
          </select>
        </label>
        <label>Session
          <select id="training-period" name="period">
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </label>
        <label>Workout
          <select id="training-template" name="template"></select>
        </label>
        <label id="training-run-type-field" hidden>Run workout
          <select id="training-run-type" name="run_type">
            <option value="easy">Easy run</option>
            <option value="fartlek">Fartlek</option>
            <option value="intervals">Intervals</option>
            <option value="tempo">Tempo run</option>
            <option value="threshold">Threshold run</option>
            <option value="long">Long run</option>
            <option value="benchmark">5 km benchmark</option>
          </select>
        </label>
        <label>Body weight <span>kg</span>
          <input id="training-body-weight" name="body_weight" type="number" min="40" max="200" step="0.1" inputmode="decimal" placeholder="80.0">
        </label>
        <label>Sleep <span>hours</span>
          <input id="training-sleep" name="sleep" type="number" min="0" max="16" step="0.25" inputmode="decimal" placeholder="7.25">
        </label>
        <label>Readiness <span>1–5</span>
          <select id="training-readiness" name="readiness">
            <option value="">Select</option><option value="1">1 · Very low</option><option value="2">2 · Low</option><option value="3">3 · Normal</option><option value="4">4 · Good</option><option value="5">5 · Excellent</option>
          </select>
        </label>
      </div>
      <div class="training-cycle-focus" aria-live="polite">
        <span id="training-cycle-kicker">WEEK 1 · RPE 6</span>
        <strong id="training-cycle-title">Technique and repeatability</strong>
        <p id="training-cycle-copy">Leave four good reps available. Every repetition should look the same.</p>
      </div>
      <div class="training-prep-checks" aria-label="Preparation checklist">
        <label><input id="training-warmup-complete" name="warmup_complete" type="checkbox"> <span><strong>Warm-up completed</strong>Dynamic movement, then progressive ramp-up sets.</span></label>
        <label><input id="training-cooldown-complete" name="cooldown_complete" type="checkbox"> <span><strong>Cooldown + stretch completed</strong>Easy downshift, then your mobility work.</span></label>
      </div>
      <label class="training-plan-field">Today’s plan or focus
        <textarea id="training-plan" name="plan" rows="2" placeholder="Heavy but technically clean squats; stop if depth or bracing degrades."></textarea>
      </label>
    </section>

    <section class="training-panel training-dashboard-week-plan" aria-live="polite">
      <div class="training-panel-heading">
        <div><span>WEEK</span><h2>Your plan at a glance</h2></div>
        <p>Strength, running, and recovery without leaving the dashboard.</p>
      </div>
      <p id="training-week-strength" class="training-week-strength"></p>
      <p id="training-week-running" class="training-week-running"></p>
      <div id="training-week-schedule" class="training-week-schedule"></div>
    </section>

    <section class="training-panel">
      <div class="training-panel-heading">
        <div><span>02</span><h2>Exercises</h2></div>
        <p>The prescription changes with the selected cycle week.</p>
      </div>
      <div id="training-exercises" class="training-exercises"></div>
      <div class="training-add-exercise">
        <label>Add an extra
          <select id="training-extra-exercise-mode" aria-label="Type of extra exercise">
            <option value="strength">Strength exercise</option>
            <option value="cardio">Cardio activity</option>
            <option value="mobility">Mobility work</option>
          </select>
        </label>
        <button id="training-add-exercise" type="button"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add exercise</button>
      </div>
    </section>

    <section class="training-panel">
      <div class="training-panel-heading">
        <div><span>03</span><h2>Close the session</h2></div>
        <p>A short honest note is more useful than a perfect one.</p>
      </div>
      <div class="training-input-grid training-close-grid">
        <label>Duration <span>minutes</span>
          <input id="training-duration" name="duration" type="number" min="0" max="360" step="1" inputmode="numeric" placeholder="70">
        </label>
        <label>Session RPE <span>1–10</span>
          <input id="training-session-rpe" name="session_rpe" type="number" min="1" max="10" step="0.5" inputmode="decimal" placeholder="8">
        </label>
      </div>
      <label class="training-plan-field">Notes
        <textarea id="training-notes" name="notes" rows="3" placeholder="What felt strong? What should change next time?"></textarea>
      </label>
      <div class="training-form-actions">
        <button class="training-save-button" type="submit"><i class="fa-solid fa-check" aria-hidden="true"></i> Save workout</button>
        <span id="training-save-status" class="training-save-status" role="status" aria-live="polite"></span>
      </div>
    </section>

  </form>

  <section class="training-panel training-history-panel">
    <div class="training-panel-heading">
      <div><span>04</span><h2>Recent sessions</h2></div>
      <div class="training-data-actions">
        <button id="training-export" type="button">Export backup</button>
        <button id="training-clear" class="training-danger-button" type="button">Clear local data</button>
      </div>
    </div>
    <div id="training-history" class="training-history"></div>
  </section>

  <section class="training-panel training-coach-preview">
    <div class="training-panel-heading">
      <div><span>05</span><h2>Coach</h2></div>
      <span class="training-coming-soon">NEXT PHASE</span>
    </div>
    <p>After the logger feels right, this panel can summarize training, suggest the next working weights, and review fatigue through a secure server connection. No API key will ever be placed in the browser.</p>
  </section>
</div>
