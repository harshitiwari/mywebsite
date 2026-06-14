---
layout: page
title: News
permalink: /news/
toc:
  sidebar: right
---

<div class="news">
  {% if site.news != blank %}
    {% assign news = site.news | reverse %}
    {% assign news_by_year = news | group_by_exp: "item", "item.date | date: '%Y'" %}
    {% for year_group in news_by_year %}
      <h2 id="{{ year_group.name }}">{{ year_group.name }}</h2>
      <div class="table-responsive">
        <table class="table table-sm table-borderless">
          {% for item in year_group.items %}
            <tr>
              <th scope="row" style="width: 20%">{{ item.date | date: '%b %d' }}</th>
              <td>
                {% if item.inline %}
                  {{ item.content | remove: '<p>' | remove: '</p>' | emojify }}
                {% else %}
                  <a class="news-title" href="{{ item.url | relative_url }}">{{ item.title }}</a>
                {% endif %}
              </td>
            </tr>
          {% endfor %}
        </table>
      </div>
    {% endfor %}
  {% else %}
    <p>No news so far...</p>
  {% endif %}
</div>

