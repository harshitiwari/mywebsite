---
layout: page
permalink: /repositories/
title: Repositories
description: Open-source code and scientific-computing work on GitHub.
nav: false
nav_order: 7
---

{% if site.data.repositories.github_users %}

## GitHub profile

[View @harshitiwari on GitHub](https://github.com/harshitiwari){: .btn .btn-sm .btn-outline-primary target="\_blank" rel="noopener noreferrer"}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

## Public repositories

<div class="repository-grid">
  {% for repo in site.data.repositories.github_repos %}
    {% assign repo_parts = repo | split: '/' %}
    {% assign repo_name = repo_parts | last %}
    <a class="repository-card" href="https://github.com/{{ repo }}" target="_blank" rel="noopener noreferrer">
      <span class="repository-card-icon"><i class="fa-brands fa-github" aria-hidden="true"></i></span>
      <span class="repository-card-copy">
        <strong>{{ repo_name }}</strong>
        <small>{{ repo }}</small>
      </span>
      <i class="fa-solid fa-arrow-up-right-from-square repository-card-arrow" aria-hidden="true"></i>
    </a>
  {% endfor %}
</div>
{% endif %}
