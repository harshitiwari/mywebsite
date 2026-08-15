---
layout: default
permalink: /blogs/
title: Blogs
nav: true
nav_order: 5
---

<div class="post">

  <div class="header-bar">
    <h1>Blogs</h1>
    <h2>Personal essays on learning, physics, and education.</h2>
  </div>

  <ul class="post-list">

    {% assign blog_posts = site.posts | where_exp: "post", "post.categories contains 'blogs'" | where_exp: "post", "post.unlisted != true" %}

    {% for post in blog_posts %}

      {% assign read_time = post.content | number_of_words | divided_by: 240 | plus: 1 %}

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

    {% endfor %}

  </ul>

</div>
