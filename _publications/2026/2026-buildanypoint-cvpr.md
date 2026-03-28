---
title: "BuildAnyPoint: 3D Building Structured Abstraction from Diverse Point Clouds"
date: 2026-02-27 00:01:00 +0800
selected: true
pub: "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)"
pub_date: "2026"
cover: /assets/images/teaser/buildanypoint.png
scholar_url: "https://ai4city-hkust.github.io/BuildAnyPoint/"
abstract: >-
  We introduce BuildAnyPoint, a novel generative framework for structured 3D building reconstruction from point clouds with diverse distributions, such as those captured by airborne LiDAR and Structure-from-Motion. To recover artist-created building abstraction in this highly underconstrained setting, we capitalize on the role of explicit 3D generative priors in autoregressive mesh generation. Specifically, we design a Loosely Cascaded Diffusion Transformer (Loca-DiT) that initially recovers the underlying distribution from noisy or sparse points, followed by autoregressively encapsulating them into compact meshes. We first formulate distribution recovery as a conditional generation task by training latent diffusion models conditioned on input point clouds, and then tailor a decoder-only transformer for conditional autoregressive mesh generation based on the recovered point clouds. Our method delivers substantial qualitative and quantitative improvements over prior building abstraction methods. Furthermore, the effectiveness of our approach is evidenced by the strong performance of its recovered point clouds on building point cloud completion benchmarks, which exhibit improved surface accuracy and distribution uniformity.
authors:
  - Tongyan Hua<sup>†</sup>
  - <strong>Haoran Gong<sup>†</sup></strong>
  - Yuan Liu
  - Di Wang
  - Ying-Cong Chen
  - Wufan Zhao 
  - (<sup>†</sup> Equal contribution)
links:
  arXiv: "https://arxiv.org/abs/2602.23645"
  PDF: "https://arxiv.org/pdf/2602.23645"
---
