---
layout: page
title: Compressible Turbulent Convection
description: Heat transport and scaling laws at extreme Rayleigh numbers.
importance: 2
category: research
img: assets/img/projects/compressible-convection.png
---

My doctoral research investigated compressible turbulent convection at extreme Rayleigh numbers. We performed direct numerical simulations and compared compressible convection with Rayleigh–Bénard and periodic convection, reaching $Ra=10^{16}$ in two dimensions and $Ra=10^{13}$ in three dimensions.

![Fully compressible turbulent convection in a rectangular domain](/assets/img/projects/compressible-convection.png){: .img-fluid .rounded .z-depth-1 }

_A fully compressible turbulent-convection simulation from the original project gallery._

## What we did

We separated the local vertical convective heat flux,

$$
F_z(\mathbf{x}) = \rho u_z T_{\mathrm{sa}},
$$

into its positive and negative contributions. The Nusselt number can then be written schematically as

$$
Nu = 1 + \sqrt{Ra\,Pr}\left(\langle F_z^+\rangle + \langle F_z^-\rangle\right).
$$

Although $\langle F_z^+\rangle$ and $\lvert\langle F_z^-\rangle\rvert$ are individually large, the thermal plates make them nearly cancel. We found that their imbalance decreases approximately as $Ra^{-0.20}$. Consequently,

$$
Nu \sim Ra^{1/2}Ra^{-0.20} \sim Ra^{0.30},
$$

which explains the persistence of classical heat-transport scaling rather than a transition to the $Ra^{1/2}$ ultimate regime.

This work formed my Ph.D. thesis, _Compressible turbulent convection at extreme Rayleigh numbers_, which received the **Outstanding PhD Thesis Award from IIT Kanpur in 2026**.

[Read the PNAS paper](/assets/publications/2025/Tiwari-PNAS2025.pdf){:target="\_blank" rel="noopener noreferrer"}, [read the thesis](/assets/publications/2026/Tiwari-PhDThesis2026.pdf){:target="\_blank" rel="noopener noreferrer"}, or explore the related papers on the [publications page](/publications/).
