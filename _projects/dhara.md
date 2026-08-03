---
layout: distill
title: DHARA
description: A scalable Python framework for solving nonlinear partial differential equations on CPUs and GPUs.
importance: 1
category: software
img: assets/img/projects/dhara-extreme-scale-hpc.png
date: 2026-08-03
authors:
  - name: Harshit Tiwari
    url: https://harshitiwari.site
    affiliations:
      name: New York University
      url: https://www.nyu.edu/
toc:
  - name: Abstract
  - name: Governing equations
  - name: Numerical framework
    subsections:
      - name: Compressible flows
      - name: Incompressible flows
      - name: Quantum fluids
  - name: Software architecture
  - name: Parallel design
  - name: Performance at scale
  - name: Representative simulations
    subsections:
      - name: Kelvin–Helmholtz instability
      - name: Supersonic turbulence
      - name: Compressible convection
  - name: Scientific scope
  - name: Acknowledgements
---

## Abstract

DHARA is a general-purpose Python framework I developed for direct numerical simulation of nonlinear partial differential equations. It provides a common computational structure for compressible and incompressible flows, magnetohydrodynamics, moist convection, and quantum fluids. The same simulation code can run with NumPy on CPUs or CuPy on GPUs, while MPI distributes large domains across many nodes.

The central design goal is to keep the physics readable without sacrificing performance. Governing equations, spatial discretizations, time integrators, boundary conditions, forcing, diagnostics, and data output are separate modules. This makes it possible to change a numerical scheme without rewriting the physical model—or to add a new equation set while retaining the parallel infrastructure.

<figure style="max-width: 720px; margin: 2rem auto;">
  <img src="/assets/img/publication_preview/tiwari-thesis-dhara.png" alt="Modular architecture of the DHARA solver" class="img-fluid rounded z-depth-1">
  <figcaption>DHARA separates the physical model from numerical kernels, parallel decomposition, time integration, and data I/O.</figcaption>
</figure>

## Governing equations

Many of the systems in DHARA can be expressed as conservation laws,

$$
\frac{\partial \mathbf{q}}{\partial t}
+ \nabla\!\cdot\!\mathbf{F}(\mathbf{q})
= \mathbf{S}(\mathbf{q}),
$$

where $\mathbf{q}$ is the state vector, $\mathbf{F}$ contains advective and diffusive fluxes, and $\mathbf{S}$ represents forcing, gravity, rotation, or other physical source terms. DHARA constructs a spatial operator $\mathcal{L}$ from these components and advances the resulting system,

$$
\frac{d\mathbf{q}}{dt}=\mathcal{L}(\mathbf{q}),
$$

with an interchangeable Runge–Kutta integrator. This separation is what allows one execution framework to support physically different problems.

## Numerical framework

### Compressible flows

The compressible solver includes both finite-volume and finite-difference formulations. Shock-containing flows use the semi-discrete Kurganov–Tadmor central-upwind method together with linear, WENO, CWENO, or TENO reconstruction through seventh order. These schemes resolve smooth turbulent structure while remaining robust near discontinuities.

For low-turbulent-Mach-number convection, DHARA also includes a TVD–MacCormack formulation designed to reduce numerical cost while preserving the large range of dynamically active scales. The framework supports two- and three-dimensional Euler flow, compressible magnetohydrodynamics, dry and moist convection, and more specialized compressible systems.

### Incompressible flows

The incompressible module uses finite differences and a projection method. A provisional velocity is advanced first; the pressure is then obtained from a Poisson problem and used to project the velocity onto a divergence-free field,

$$
\nabla\!\cdot\!\mathbf{u}=0.
$$

A multigrid solver handles the pressure Poisson equation, and standard Runge–Kutta schemes advance the remaining terms. This branch has been used for vortical flows, shear layers, and Rayleigh–Bénard convection in two and three dimensions.

### Quantum fluids

Quantum-fluid calculations solve the Gross–Pitaevskii equation,

$$
i\hbar\frac{\partial\psi}{\partial t}
=\left(-\frac{\hbar^2}{2m}\nabla^2+V+g|\psi|^2\right)\psi,
$$

using pseudo-spectral and time-splitting spectral methods. These solvers are used to study Bose–Einstein condensates, quantized vortices, ground states, and quantum turbulence in two and three dimensions.

## Software architecture

Each simulation begins with a problem class that owns the grid, state arrays, boundary conditions, forcing, and the coordination of physical operators. Flux objects such as `KTConvFlux` and `ViscousFlux` compute individual contributions, while reconstruction classes encapsulate the selected high-order method.

`TimeEvolution` provides schemes including eSSPRK2, eSSPRK3, and conventional Runge–Kutta methods through a common single-step interface. `DataIO` writes HDF5 output with h5py, supports parallel I/O, and collects global diagnostics. New equations or numerical methods can therefore be added as focused modules instead of changes spread throughout the solver.

## Parallel design

DHARA uses a dual NumPy/CuPy backend: changing the array backend moves the same high-level program between CPUs and GPUs. Performance-critical GPU expressions use custom CuPy `ElementwiseKernel` kernels to reduce temporary arrays and memory traffic.

MPI decomposes the physical domain across processes. Slab decomposition is sufficient for many finite-difference and finite-volume problems, while pencil decomposition supports larger three-dimensional workloads and spectral operations. Halo exchanges are localized within the spatial operators, keeping distributed-memory details out of the physics modules.

## Performance at scale

On a single NVIDIA A100 GPU, DHARA achieved up to a **200× speedup** over one AMD EPYC 7763 CPU core in the reported benchmark. The same code has run on **512 A100 GPUs** on Polaris at the Argonne Leadership Computing Facility and on **8,192 GPUs** on Frontier at the Oak Ridge Leadership Computing Facility.

The CPU implementation has also scaled to approximately **800,000 cores** on Shaheen III at KAUST. Across these machines, the aim is not only peak throughput but a portable programming model: scientists can develop and test a case locally, then move it to a leadership-scale system without maintaining a separate solver.

## Representative simulations

### Kelvin–Helmholtz instability

A two-dimensional Kelvin–Helmholtz calculation at $3072\times1920$ resolution demonstrates the interaction between high-order reconstruction and GPU execution. Seventh-order TENO captures the rolling shear layer and its secondary small-scale instabilities on a single A100 GPU.

<div style="width: 100%; margin-top: 1.5rem; margin-bottom: 2.5rem;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/rJSGPzf7D-Q"
    title="Kelvin–Helmholtz instability simulated with DHARA"
    style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

### Supersonic turbulence

Forced turbulence at Mach 3 was simulated on a $1024^3$ grid using TENO7. The calculation used 128 A100 GPUs on Polaris and was evolved to a statistically stationary state. It tests the solver in a regime where shocks coexist with a broad hierarchy of turbulent eddies.

<div style="width: 100%; margin-top: 1.5rem; margin-bottom: 2.5rem;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/4TCjBgLVgOs"
    title="Forced supersonic turbulence at Mach 3 simulated with DHARA"
    style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

### Compressible convection

DHARA has been used for two-dimensional compressible convection at Rayleigh number $Ra=10^{12}$ and three-dimensional convection at $Ra=10^8$, both in domains of aspect ratio four. These flows connect the numerical work to atmospheric and astrophysical settings, where stratification, compressibility, boundary layers, and turbulent heat transport interact across widely separated scales.

<div style="width: 100%; margin-top: 1.5rem; margin-bottom: 1rem;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/0Cxp_DymOVE"
    title="Two-dimensional compressible turbulent convection at Rayleigh number 10^12"
    style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

<div style="width: 100%; margin-top: 1rem; margin-bottom: 2.5rem;">
  <iframe
    src="https://www.youtube-nocookie.com/embed/QxhwKfrS98c"
    title="Three-dimensional compressible turbulent convection at Rayleigh number 10^8"
    style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px;"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

## Scientific scope

DHARA is less a single-purpose application than a laboratory for computational physics. Its common abstractions make it possible to compare numerical methods across classical and quantum fluids, investigate turbulent transport in convection, explore shock-dominated regimes, and test algorithms from a workstation to the largest supercomputers.

The project is closed source, but its scientific results, numerical methods, and scaling studies are documented through my [publications](/publications/) and research projects.

## Acknowledgements

Computing time and technical support were provided by the Argonne Leadership Computing Facility, the Oak Ridge Leadership Computing Facility Director’s Discretionary Program, the KAUST Supercomputing Laboratory and Shaheen III, and the Kotak School of Sustainability HPC facility at IIT Kanpur.
