# Maelstrom Echo — a first distributed-systems lab

← [Learning OS index](./index.md) · [Runtime roadmap](./runtime-roadmap.md)

This one-session lab practices reading a wire protocol, correlating a reply to
its request, and using a workload checker. It covers one node and one
request/reply operation. It does not cover consensus, persistence, membership,
or the rest of the Fly.io challenge sequence.

## Before you start

You should be comfortable writing a small program that reads and writes lines
of JSON. Choose a language you already know; this repository adds no language
runtime or Maelstrom dependency. The external exercise uses the
[Fly.io distributed-systems challenge 1](https://fly.io/dist-sys/1/) and the
[Maelstrom protocol](https://github.com/jepsen-io/maelstrom/blob/main/doc/protocol.md).
Follow their current setup and safety guidance if you choose to run it.

## Trace the contract

Read the Echo challenge and protocol reference, then write the request and
reply as two separate JSON envelopes. In your own words, identify:

1. Which envelope fields identify the sender, recipient, and message body?
2. Which value must the reply use to point back to this particular request?
3. Which body field carries the exact text that must be echoed?
4. Why should diagnostics go somewhere other than the protocol output stream?

Do not copy a reference implementation. Use the contract to make your own
small table with columns `input`, `required output`, and `invariant`.

## Build and test

Implement only the Echo operation in a scratch project using the language you
chose. Read one JSON message per input line and emit one JSON response per
line. For a request of type `echo`, preserve its payload in an `echo_ok`
response and set the response's `in_reply_to` to the request's `msg_id`.
Keep logs off standard output so they cannot be mistaken for protocol
messages. Treat the protocol's initialization message as setup, not as an Echo
request.

If Maelstrom is already available in your environment, the upstream workload
is bounded to one node and ten seconds:

```sh
./maelstrom test -w echo --bin ./your-program \
  --node-count 1 --time-limit 10
```

Use the current command documented by the challenge if its interface changes.
Do not run this against a service or production system; the harness launches a
local process. If you do not have Maelstrom installed, the protocol trace and
your own table are still useful preparation, but they are not a passing test.

## Explain the result

Save a short artifact beside your scratch project containing:

- the input/output envelope table;
- the exact test command and result, or “not run” with the reason;
- one bug you deliberately considered (for example, replying with the node's
  latest message ID instead of the request ID) and how the invariant catches
  it;
- a three-sentence explanation of why a correct reply needs correlation, not
  just the original payload.

The successful workload is evidence that the tested Echo contract held for
that run. It does not demonstrate fault tolerance or correctness under
concurrent, partitioned, or persistent workloads.

## Primary sources

- [Fly.io Distributed Systems Challenge 1: Echo](https://fly.io/dist-sys/1/)
- [Maelstrom protocol specification](https://github.com/jepsen-io/maelstrom/blob/main/doc/protocol.md)
- [Maelstrom getting-ready guide](https://github.com/jepsen-io/maelstrom/blob/main/doc/01-getting-ready/index.md)

Last audited: 2026-10-02.
