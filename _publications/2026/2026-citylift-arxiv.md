---
title: "CityLift: Compositional 3D Urban Generation from a Single Image"
date: 2026-10-23 00:01:00 +0800
selected: true
pub: "Pre-print"
pub_date: "2026"
cover: /assets/images/teaser/citylift.webp
scholar_url: "https://ranhaogong.github.io/CityLift/"
abstract: >-
  Generating editable 3D urban scenes from a single image requires detailed building assets with a coherent spatial arrangement. Occlusion and perspective ambiguity make it difficult to infer complete building geometry together with consistent relative scales and positions. We present CityLift, a framework that generates individual textured building meshes from an urban image by coupling scene-level spatial modeling with building-level synthesis. CityLift first learns building shape and placement jointly through coupled scene and instance streams, producing coarse sparse structures in a common coordinate system. We then introduce generative spatial inheritance, which maps each building's coarse occupancy and scene-conditioned 3D feature field into a local volume to guide a flow model that generates finer structure. The same coordinate mapping places the generated meshes back into the scene, preserving their spatial relationship to the scaffold. To address the scarcity of urban data pairing scene images with individual 3D buildings, we construct CityLift-5K, comprising 4,997 synthetic scenes with instance masks, building meshes, and placement annotations. Experiments on CityLift-5K and scene blocks from UrbanScene3D and InstanceBuilding demonstrate improved building geometry and scene composition.
authors:
  - <strong>Haoran Gong</strong>
  - Jie Feng
  - Chenxu Wang
links:
  code comming: ""
  arXiv: "https://arxiv.org/abs/2610.32728"
  PDF: "https://arxiv.org/pdf/2610.32728"
---
