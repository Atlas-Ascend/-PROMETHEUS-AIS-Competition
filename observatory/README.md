# Ghost Atlas Empire Public Observatory Feed

This directory contains the public-safe, read-only projection consumed by the Ghost Atlas Empire Observatory.

## Canonical feed

`public-state.json`

## Classification

`PUBLIC_SAFE_READ_ONLY`

The feed intentionally excludes private endpoints, credentials, device identities, pairing fingerprints, raw logs, private ProofGrid receipts, internal prompts, private Thoth memory, and mutation controls.

## Consumer contract

The Base44 observatory should fetch this file through a server-side backend function, validate `schema == ghost-atlas.public-observatory-state.v1`, discard unknown fields, cache the latest successful state, and expose an explicit stale or unavailable state when refresh fails.

## Authority boundary

The feed grants no command, approval, pairing, deployment, publication, rollback, repository mutation, or promotion capability.

## Current canonical source coordinates

- Mothership: `fba474860006c1168c216c4c269f014c6663af17`
- Janus-Prime: `739109d9c36c89fef64660aaad33088c782c69cd`
- Public projection commit: recorded in repository history
