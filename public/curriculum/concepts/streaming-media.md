# Streaming Media

CDN, HLS, transcoding pipeline.

- Difficulty: core
- Tracks: System Design

## Mental model

Video streaming is CDN plus adaptive bitrate (HLS or DASH). The origin server should never serve video directly to viewers; the player switches quality on the fly based on the user's bandwidth. Design for the user on bad wifi, not the demo.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [HTTP Live Streaming (Apple Developer)](https://developer.apple.com/streaming/) (doc)
- [RFC 8216 — HTTP Live Streaming](https://www.rfc-editor.org/rfc/rfc8216) (paper)
- [Netflix — Per-Title Encode Optimization](https://netflixtechblog.com/per-title-encode-optimization-7e99442b62a2) (article)
- [Netflix Open Connect (their own CDN)](https://openconnect.netflix.com/en/) (doc)

## Practice

### Video streaming (Netflix-style)

Design a video-on-demand service: catalog browse, adaptive bitrate streaming, CDN distribution. Walk through what happens from play-button press to first frame on screen.

**Expected evidence:** CDN + manifest (HLS/DASH) flow + the bitrate-adaptation loop.

## Review prompts

- What does adaptive bitrate demand of the encoding pipeline?


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping)
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching)

## Related concepts

- None assigned.

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
