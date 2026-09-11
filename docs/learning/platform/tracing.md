# Lesson 2 — Propagation and ParentBased sampling

## Mental model

Propagation and sampling are separate decisions:

1. The propagator extracts a parent SpanContext from request headers.
2. The sampler decides whether the new server span records and exports.
3. ParentBased selects a branch before it consults any root sampler.

Both lab services receive the same kind of header:

    X-Cloud-Trace-Context: TRACE_ID/SPAN_ID;o=0

That becomes a valid remote, unsampled parent.

`api-broken` uses the normal ParentBased defaults:

    remote parent not sampled -> NeverSample

`api-fixed` treats the public load balancer as an untrusted edge and applies its
own ratio to either remote sampling flag:

    remote parent sampled     -> TraceIDRatioBased
    remote parent not sampled -> TraceIDRatioBased

## Prediction

With a configured ratio of 1.0, predict:

1. Which service returns `"sampled": true`?
2. Which trace ID appears in Collector output?
3. Would changing only the broken service's root ratio help?

Run:

    make verify SCENARIO=tracing

Then inspect the evidence:

    export KUBECONFIG="$PWD/.state/kubeconfig"
    kubectl -n lab-system logs deployment/otel-collector --since=5m

Explain back: why did a propagator intended to preserve distributed traces
cause the root sampling ratio to become irrelevant?
