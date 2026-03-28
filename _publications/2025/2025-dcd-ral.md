---
title: "Enhancing 3D Instance Segmentation with Dense Connection Decoder and Layer-Aware Fusion"
date: 2025-08-18 00:01:00 +0800
selected: false
pub: "IEEE Robotics and Automation Letters"
pub_date: "2025"
cover: /assets/images/teaser/dcd.png
scholar_url: "https://ieeexplore.ieee.org/document/11129153"
abstract: >-
  3D instance segmentation (3DIS) aims to identify object instances in a 3D scene by predicting binary foreground masks with corresponding semantic labels. Transformer-based methods have demonstrated strong performance by effectively capturing global context information through attention mechanisms. However, existing approaches primarily focus on capturing external relationships between scene features and instance queries, while overlooking internal dependencies between queries across decoder layers. This limitation can lead to inconsistencies in query mask predictions across layers, ultimately hindering segmentation performance and slowing model convergence. To address this, we propose the Dense Connection Decoder (DCD), a novel architecture that explicitly models dependencies between instance queries across decoder layers. Our design introduces a Fusion Module and a Memory Module to construct layer-aware hybrid states, dynamically assigning information weights to previous queries based on their decoder distance. Additionally, a Selection Module refines query features through a gating mechanism, adaptively controlling the influence of upstream information. By enforcing prediction consistency across layers, DCD not only enhances segmentation accuracy, but also accelerates model convergence. Extensive experiments on ScanNetV2, ScanNet++V2, ScanNet200, and S3DIS demonstrate that DCD outperforms existing transformer-based baselines, achieving state-of-the-art performance and faster convergence.
authors:
  - Duanchu Wang
  - <strong>Haoran Gong</strong>
  - Di Wang
links:
  code: "https://github.com/wdczz/Enhancing-3D-Instance-Segmentation-with-Dense-Connection-Decoder-and-Layer-Aware-Fusion"
  arXiv: "https://ieeexplore.ieee.org/document/11129153"
  PDF: "https://ieeexplore.ieee.org/document/11129153"
---
