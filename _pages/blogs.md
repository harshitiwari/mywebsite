---
layout: default
permalink: /blogs/
title: Blogs
nav: false
pagination:
  enabled: true
  collection: posts
  permalink: /blogs/page/:num/
  per_page: 10
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post">

  <div class="header-bar">
    <h1>Blogs</h1>
    <h2>Personal essays on learning, physics, and education.</h2>
  </div>

  <ul class="post-list">

    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}

    {% if post.categories contains "blogs" %}

      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}

      <li>
        <h3>
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <p>{{ post.description }}</p>
        <p class="post-meta">
          {{ read_time }} min read &nbsp; &middot; &nbsp;
          {{ post.date | date: '%B %d, %Y' }}
        </p>
      </li>

    {% endif %}

    {% endfor %}

  </ul>

{% if page.pagination.enabled %}
{% include pagination.liquid %}
{% endif %}

</div>
