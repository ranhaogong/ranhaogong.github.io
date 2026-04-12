---
title: "CompetitorFormer: Mitigating Query Conflicts for 3D Instance Segmentation via Competitive Strategy"
date: 2026-02-27 00:01:00 +0800
selected: false
pub: "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)"
pub_date: "2026"
cover: /assets/images/teaser/competitorformer.png
scholar_url: "https://arxiv.org/abs/2411.14179"
abstract: >-
  Transformer-based methods have become the dominant approach for 3D instance segmentation. These methods predict instance masks via instance queries, ranking them by classification confidence and IoU scores to select the top prediction as the final outcome. However, it has been observed that the current models employ a fixed and higher number of queries than the instances present within a scene. In such instances, multiple queries predict the same instance, yet only a single query is ultimately optimized. The close scores of queries in the lower-level decoders make it challenging for the dominant query to distinguish itself rapidly, which ultimately impairs the model's accuracy and convergence efficiency. This phenomenon is referred to as inter-query competition. To address this challenge, we put forth a series of plug-and-play competition-oriented designs, collectively designated as the CompetitorFormer, with the aim of reducing competition and facilitating a dominant query. Experiments showed that integrating our designs with state-of-the-art frameworks consistently resulted in significant performance improvements in 3D instance segmentation across a range of datasets.
authors:
  - Duanchu Wang
  - Junjie Yang
  - <strong>Haoran Gong</strong>
  - Jing Liu
  - Di Wang
links:
  code: "https://github.com/DuanchuWang/CompetitorFormer"
  arXiv: "https://arxiv.org/abs/2411.14179"
  PDF: "https://arxiv.org/pdf/2411.14179"
---
