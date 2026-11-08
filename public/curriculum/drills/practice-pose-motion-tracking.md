# Design exercise: Pose & Motion Tracking

> Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency. Implement designOutline() returning non-empty values for: landmarks, temporalTracking, occlusionHandling. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-pose-motion-tracking

Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency. Implement designOutline() returning non-empty values for: landmarks, temporalTracking, occlusionHandling. Each value must name a concrete mechanism or decision.

## The mechanism

Pose tracking is temporal estimation under ambiguity. Combine per-frame evidence with identity, motion priors, smoothing, and explicit confidence through occlusion.

## Expected evidence

A design outline with landmarks, temporalTracking, occlusionHandling plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [BlazePose: On-device Real-time Body Pose Tracking](https://arxiv.org/abs/2006.10204)
- [Stacked Hourglass Networks for Human Pose Estimation](https://arxiv.org/abs/1603.06937)
- [OpenPose: Realtime Multi-Person 2D Pose Estimation using Part Affinity Fields](https://arxiv.org/abs/1812.08008)
- [CMU Panoptic Studio — Massively Multiview Social Motion Capture](https://www.cs.cmu.edu/~hanbyulj/panoptic-studio/)
- [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)
- [Study Pose & Motion Tracking](https://learn.significanthobbies.com/curriculum/concepts/pose-motion-tracking)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-pose-motion-tracking)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
