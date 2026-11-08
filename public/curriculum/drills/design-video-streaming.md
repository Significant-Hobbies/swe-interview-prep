# Video streaming (Netflix-style)

> Design a video-on-demand service: catalog browse, adaptive bitrate streaming, CDN distribution. Walk through what happens from play-button press to first frame on screen.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-video-streaming

Design a video-on-demand service: catalog browse, adaptive bitrate streaming, CDN distribution. Walk through what happens from play-button press to first frame on screen.

## The mechanism

Video streaming is CDN plus adaptive bitrate (HLS or DASH). The origin server should never serve video directly to viewers; the player switches quality on the fly based on the user's bandwidth. Design for the user on bad wifi, not the demo.

## Expected evidence

CDN + manifest (HLS/DASH) flow + the bitrate-adaptation loop.

## Hints

- Origin servers should never serve video to end users.
- Pre-warm the CDN for predictable launches.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [HTTP Live Streaming (Apple Developer)](https://developer.apple.com/streaming/)
- [RFC 8216 — HTTP Live Streaming](https://www.rfc-editor.org/rfc/rfc8216)
- [Netflix — Per-Title Encode Optimization](https://netflixtechblog.com/per-title-encode-optimization-7e99442b62a2)
- [Netflix Open Connect (their own CDN)](https://openconnect.netflix.com/en/)
- [Study Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-video-streaming)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
