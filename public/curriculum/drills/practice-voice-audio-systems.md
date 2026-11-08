# Design exercise: Voice & Audio Systems

> Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX. Implement designOutline() returning non-empty values for: audioPipeline, turnDetection, latencyBudget. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-voice-audio-systems

Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX. Implement designOutline() returning non-empty values for: audioPipeline, turnDetection, latencyBudget. Each value must name a concrete mechanism or decision.

## The mechanism

Voice systems are real-time pipelines. Audio framing, endpointing, ASR, reasoning, TTS, interruption, and playback each consume the latency budget.

## Expected evidence

A design outline with audioPipeline, turnDetection, latencyBudget plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Web Audio API](https://www.w3.org/TR/webaudio/)
- [Study Voice & Audio Systems](https://learn.significanthobbies.com/curriculum/concepts/voice-audio-systems)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-voice-audio-systems)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
