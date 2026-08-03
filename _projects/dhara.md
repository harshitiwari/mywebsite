---
layout: page
title: DHARA PDE Solver
description: A scalable Python solver for GPU-accelerated, distributed fluid simulations.
importance: 1
category: software
img: assets/img/publication_preview/tiwari-thesis-dhara.png
---

DHARA is a general partial-differential-equation solver that I developed for large-scale direct numerical simulations. It combines a Python-facing workflow with GPU acceleration and MPI-based distributed computing.

I have used DHARA to simulate compressible convection, shocks, and turbulence. At the Frontier Hackathon, the solver was scaled to **8,192 AMD MI250X GPUs** on the Frontier supercomputer at Oak Ridge National Laboratory.

![Modular architecture of the DHARA solver](/assets/img/publication_preview/tiwari-thesis-dhara.png){: .img-fluid .rounded .z-depth-1 }

_DHARA separates grids, physics modules, numerical kernels, time integration, and data I/O so that new equation sets and schemes can share the same execution framework._

## What we built

DHARA advances systems of conservation laws of the form

$$
\frac{\partial \mathbf{q}}{\partial t}
+ \nabla\!\cdot\!\mathbf{F}(\mathbf{q})
= \mathbf{S}(\mathbf{q}),
$$

with interchangeable physics and numerical modules. It supports Euler and compressible-flow systems, turbulent convection, moist convection, magnetohydrodynamics, and quantum-fluid models.

## Capabilities

- GPU-accelerated numerical kernels
- MPI-based multi-node scaling
- WENO and TENO high-order shock-capturing reconstructions
- Explicit SSP Runge–Kutta and implicit–explicit time integration
- In-situ diagnostics and visualization-ready output

For three-dimensional decaying compressible turbulence, the measured timestep cost followed approximately

$$
t_{\mathrm{step}}\propto N_{\mathrm{nodes}}^{-1},
$$

showing strong scaling on both Frontier and Polaris, together with good weak scaling when the grid size and node count were increased proportionally.

[Project overview](https://harshtiwari.notion.site/DHARA-A-general-PDE-solver-26d6da4c3d6080019eb2de57235cae2b){:target="\_blank" rel="noopener noreferrer"}.
