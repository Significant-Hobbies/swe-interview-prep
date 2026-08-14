# Pose & Motion Tracking

Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency.

- Difficulty: core
- Tracks: Multimodal & Spatial Computing

## Mental model

Pose tracking is temporal estimation under ambiguity. Combine per-frame evidence with identity, motion priors, smoothing, and explicit confidence through occlusion.



## Primary sources

- [BlazePose: On-device Real-time Body Pose Tracking](https://arxiv.org/abs/2006.10204) (doc)
- [Stacked Hourglass Networks for Human Pose Estimation](https://arxiv.org/abs/1603.06937) (doc)
- [OpenPose: Realtime Multi-Person 2D Pose Estimation using Part Affinity Fields](https://arxiv.org/abs/1812.08008) (paper)
- [CMU Panoptic Studio — Massively Multiview Social Motion Capture](https://www.cs.cmu.edu/~hanbyulj/panoptic-studio/) (article)
- [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) (doc)

## Practice

### Design exercise: Pose & Motion Tracking

Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency. Implement designOutline() returning non-empty values for: landmarks, temporalTracking, occlusionHandling. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with landmarks, temporalTracking, occlusionHandling plus an explicit failure mode or trade-off.

## Review prompts

- Per-frame landmark detection is accurate but the skeleton jitters. What is happening and what is the tradeoff in fixing it?

## Build evidence

- **Synthesize: Multimodal & Spatial Computing** — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Vision Models](https://learn.significanthobbies.com/curriculum/concepts/vision-models)

## Related concepts

- [Voice & Audio Systems](https://learn.significanthobbies.com/curriculum/concepts/voice-audio-systems)
- [Image & Video Generation](https://learn.significanthobbies.com/curriculum/concepts/image-video-generation)

## Learning paths

- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
