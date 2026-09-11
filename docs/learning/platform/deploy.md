# Lesson 1 — Git, ESO, migration waves, and rollout

## Mental model

Argo reconciles declared Kubernetes objects. It does not synchronously fetch a
GCP secret or execute a migration itself:

    Argo applies ExternalSecret
        ESO observes it
        ESO reads the fake provider
        ESO writes platform-lab-secret

    Argo creates migration Job
        Kubernetes creates Pod
        kubelet resolves secretKeyRef
        process changes MySQL
        Job controller reports Complete or Failed

The healthy path is ordered as:

    -2 ExternalSecret
    -1 migration hook
     0 Deployments

## Observe the healthy path

Predict which resource owns each status before running:

    export KUBECONFIG="$PWD/.state/kubeconfig"
    kubectl -n lab-apps get externalsecret platform-lab -o yaml
    kubectl -n lab-apps get job platform-lab-migrate -o yaml
    kubectl -n argocd get application platform-lab -o yaml

Then check the actual database outcome:

    make verify SCENARIO=baseline

## Controlled failure

This changes only the local Git repository. The migration command creates its
first table and then exits non-zero. It also changes a harmless annotation on a
normal resource so Argo must begin a sync: a revision that changes only a hook
can otherwise compare as Synced because hooks are excluded from normal resource
tracking.

Before applying it, predict:

1. How many failed Pods can exist with `backoffLimit: 3`?
2. Does Argo apply wave 0 after the hook fails?
3. What are the Application's health, sync, and operation states?
4. Does the first successful DDL statement still exist?

Apply and watch:

    make scenario SCENARIO=migration-failure
    watch -n 2 'KUBECONFIG=.state/kubeconfig kubectl -n lab-apps get job,pod'
    make status
    make verify SCENARIO=baseline

Inspect the operation independently of the health badge:

    KUBECONFIG=.state/kubeconfig kubectl -n argocd get application platform-lab \
      -o jsonpath='{.status.health.status}{" / "}{.status.sync.status}{" / "}{.status.operationState.phase}{"\n"}'

Restore with a new Git commit:

    make scenario SCENARIO=migration-failure ACTION=restore
    make verify SCENARIO=baseline

Explain back: why is an Argo health badge insufficient evidence that the most
recent migration succeeded?
