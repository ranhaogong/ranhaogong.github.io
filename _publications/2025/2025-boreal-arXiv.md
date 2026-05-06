---
title: "A synthetic data generation framework for deep learning-based LiDAR forest structure analysis"
date: 2025-01-07 00:01:00 +0800
selected: false
pub: "Remote Sensing of Environment"
pub_date: "2025"
cover: /assets/images/teaser/boreal.png
scholar_url: "https://arxiv.org/abs/2501.03637"
abstract: >-
  Accurate characterization of the three-dimensional (3D) structure of forests is fundamental for forest inventory, ecological monitoring, biodiversity conservation, and sustainable resource management. In recent years, deep learning has been increasingly applied to forestry, showing transformative potential for automated feature extraction and structural analysis. Yet, progress remains constrained by the scarcity of large-scale, well-annotated forest point cloud datasets, which limits both methodological innovation and the reliable deployment of data-driven approaches. To overcome this bottleneck, we propose a fully automated synthetic data generation framework grounded in the concepts of Digital Cousins and Simulation-to-Reality (Sim2Real), designed for versatility across scales and laser scanning platforms. Leveraging this framework, we introduce Boreal3D, a synthetic dataset comprising 1000 structurally diverse forest plots simulated for airborne (ALS), unmanned vehicle (ULS), mobile (MLS), and terrestrial (TLS) laser scanning. The dataset encompasses 48,403 trees and over 35.3 billion points, each annotated with semantic and instance labels, acquisition metadata, and detailed structural parameters (e.g., diameter, crown width, leaf area, and wood volume). To our knowledge, Boreal3D represents the largest fully annotated synthetic forest plot point cloud dataset worldwide in terms of point counts. Extensive experiments demonstrate that models pre-trained on Boreal3D can enhance fine-grained 3D forest structure analysis in real-world scenarios. Notably, fine-tuning with only 20% of real data achieves performance comparable to training on the entire real dataset, underscoring the efficiency and transferability of synthetic pre-training. By providing both a scalable framework and a sizeable dataset, Boreal3D establishes a critical foundation for accelerating research in large-scale 3D forest structure characterization.

authors:
  - Jing Liu
  - Duanchu Wang
  - <strong>Haoran Gong</strong>
  - Chongyu Wang
  - Jihua Zhu
  - Di Wang
links:
  Dataset: "https://boreal3d.github.io/"
  PDF: "https://www.sciencedirect.com/science/article/abs/pii/S0034425726002063"
---
