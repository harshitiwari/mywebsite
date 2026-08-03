---
layout: page
title: Supersonic Turbulence
description: Energy spectra and fluxes from high-fidelity direct numerical simulations.
importance: 3
category: research
img: assets/img/publication_preview/tiwari-supersonic-flow.png
---

This project examines how kinetic energy moves across scales in compressible and supersonic turbulence. We performed $1024^3$ direct numerical simulations spanning turbulent Mach numbers $0.2\leq M_t\leq3.0$, resolving the transition from subsonic eddies to shock-dominated flow.

![Vorticity, velocity divergence, and density-gradient fields in supersonic turbulence](/assets/img/publication_preview/tiwari-supersonic-flow.png){: .img-fluid .rounded .z-depth-1 }

_Vorticity, velocity divergence, and normalized density-gradient fields as the turbulent Mach number increases from 1.4 to 3.0._

## What we did

We decomposed velocity into rotational and compressive components,

$$
\mathbf{u}=\mathbf{u}^{R}+\mathbf{u}^{C},
\qquad \nabla\!\cdot\!\mathbf{u}^{R}=0,
\qquad \nabla\!\times\!\mathbf{u}^{C}=0,
$$

and measured their spectra, fluxes, cross-transfers, and pressure dilatation scale by scale. With increasing $M_t$, the rotational spectrum steepens from Kolmogorov-like $k^{-5/3}$ toward $k^{-2}$, while the compressive spectrum becomes shallower. The cause is not a single universal cascade: solenoidal-to-compressive transfer becomes strong throughout the inertial range, and pressure dilatation converts compressive kinetic energy into internal energy.

In the supersonic regime, the compressive statistics also approach Burgers-like shock scaling,

$$
U_C \approx \frac{\Delta V}{\sqrt{12}},
\qquad
\Pi_C \approx \frac{(\Delta V)^3}{12L}.
$$

These results build a scale-resolved physical picture of strongly compressible turbulence relevant to astrophysical and high-speed flows.

[Read the current manuscript](/assets/publications/2026/Tiwari-arxiv2026_supersonic.pdf){:target="\_blank" rel="noopener noreferrer"}.
