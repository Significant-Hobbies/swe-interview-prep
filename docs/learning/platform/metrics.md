# Lesson 3 — Exposed is not scraped

## Mental model

Three independent facts must all be true:

1. The process exposes `/metrics`.
2. discovery selects the Pod.
3. the collector successfully scrapes and stores the response.

A passing HTTP test proves only fact 1.

The lab applies the real Google `PodMonitoring` CRD schema, while local
Prometheus provides a visible storage/query backend. The automated check proves:

- the PodMonitoring selector matches a live Pod;
- that Pod declares the named `http` port;
- Prometheus stores `lab_http_requests_total`.

It does not claim to reproduce Monarch ingestion.

## Healthy path

Predict the selected Pod before running:

    export KUBECONFIG="$PWD/.state/kubeconfig"
    kubectl -n lab-apps get podmonitoring platform-lab -o yaml
    kubectl -n lab-apps get pods --show-labels
    make verify SCENARIO=metrics

Prometheus is available at:

    http://localhost:18080

## Controlled selector failure

Apply a valid PodMonitoring whose selector matches nothing:

    make scenario SCENARIO=metrics-selector-miss
    make verify SCENARIO=metrics

The Kubernetes object still exists and the metrics endpoint still works, but
verification must fail because discovery is dead.

Restore it:

    make scenario SCENARIO=metrics-selector-miss ACTION=restore
    make verify SCENARIO=metrics

Explain back: why can a manifest-validation test and an endpoint test both pass
while production metrics remain completely absent?
