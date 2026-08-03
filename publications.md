---
layout: page
title: Publications
permalink: /publications/
nav: true
nav_order: 1
---

Peer-reviewed work in turbulence, convection, computational physics, and nonlinear dynamics. Authoritative publication records are also available on [Google Scholar](https://scholar.google.com/citations?user=pZsezWMAAAAJ).

<div class="publications">
  <h2>Published & in press</h2>
  {% bibliography --query @*[status=published] %}

  <h2>Under review</h2>
  <div class="unpublished-bibliography">
    {% bibliography --query @*[status=under_review] %}
  </div>

  <h2>In preparation</h2>
  <div class="unpublished-bibliography">
    {% bibliography --query @*[status=in_preparation] %}
  </div>
</div>
