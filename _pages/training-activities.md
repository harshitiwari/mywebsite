---
layout: default
title: Training activities
permalink: /training/activities/
description: My recent strength and endurance sessions.
nav: false
---

<section class="training-hero">
  <p class="training-eyebrow">TRAINING LOG</p>
  <h1>Recent activities.</h1>
  <p class="training-lede">Strength, running, cycling, and recovery—session by session.</p>
  <a class="training-back-link" href="{{ '/training/' | relative_url }}">Back to training</a>
</section>

<div id="training-public-activities" data-training-url="{{ '/training/' | relative_url }}" aria-live="polite"><p>Loading activities…</p></div>

<script src="{{ '/assets/js/training-cloud-config.js' | relative_url | bust_file_cache }}"></script>
<script type="module" src="{{ '/assets/js/training-public-activities.js' | relative_url | bust_file_cache }}"></script>
