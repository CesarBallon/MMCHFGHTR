# ADR 0003: Use Benita and Saja for the M02 combat vertical slice

- Status: Accepted
- Date: 2026-09-08
- Decision owners: Project owner and combat implementation team
- Tracking issue: [#15](https://github.com/CesarBallon/MMCHFGHTR/issues/15)

## Context

M01 established a deterministic, data-driven production foundation. M02 must prove the final combat and animation pipeline with two fighters before that expensive work expands to the whole roster. The pair must expose meaningfully different movement, range, timing, projectile and defensive requirements.

## Decision

M02 will use **Benita versus Saja**.

- Benita represents the heavy archetype: deliberate movement, close-range authority, Beer Bath and the concealed-revolver Hidden Shot.
- Saja represents the mobile whip archetype: faster footwork, extended braid attacks, Braid Lash and the Saya Wave projectile.

Their contrast is broad enough to exercise locomotion, spacing, throws, blocking, projectile interaction, hit stop, cancels, supers, facing changes and asymmetric animation timing.

## Consequences

- Production animation and combat tuning in M02 are limited to Benita and Saja.
- The remaining six canonical fighters stay selectable in the baseline but do not receive M02-quality combat assets.
- Shared systems must remain data-driven; fighter-specific behavior cannot be hard-coded into the simulation.
- Animation acceptance requires at least 16 unique source frames per second where motion requires them, while gameplay continues at fixed 60 Hz.
- Expansion to the remaining roster waits until the vertical slice passes its exit criteria.

## Alternatives considered

- Benita and Coraima: strong heavy-versus-balanced comparison, but less useful for proving long flexible attacks.
- Benita and Bella: useful weapon matchup, but overlaps more heavily with conventional staff/projectile implementation.

## Reversal

A pairing change requires a superseding ADR and an asset-impact review. Existing accepted Benita or Saja work remains versioned rather than overwritten.
