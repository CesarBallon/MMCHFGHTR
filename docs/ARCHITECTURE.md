# Target architecture

## Current state

The playable prototype is a dependency-free static HTML5 Canvas application in `dist/`. Combat, input, rendering, menus, audio, AI, and match state are concentrated in `dist/game.js`. ChatGPT Sites stores the source in its own Git remote; a saved Site version points to an exact commit. Saving and production deployment are separate operations.

This is effective for rapid visual iteration, but not yet a safe foundation for online ranked matches: the browser currently owns the whole simulation and there is no server identity, matchmaking, result authority, persistence, or anti-tamper boundary.

## Target system

| Component | Responsibility | Trust level |
| --- | --- | --- |
| Web client | Render, input, audio, menus, local prediction, replay playback | Untrusted |
| Deterministic combat core | Advance a match from frame number + prior state + player inputs | Shared/tested code |
| Match service | Lobby, matchmaking, session tokens, signaling/relay, disconnect state | Trusted |
| Result service | Validate match transcript/checkpoints and record final outcome once | Trusted |
| Identity service | Player account, display name, bans, privacy and consent | Trusted |
| Ranking service | Placement, rating changes, seasons and leaderboards | Trusted |
| Data store | Accounts, matches, ratings, sanctions and audit events | Trusted |
| Observability | Errors, latency, rollback depth, match completion and abuse signals | Restricted operations data |

## Client refactor boundary

The M1 client should be split into:

- `core/`: fixed-point or carefully constrained numeric simulation with no DOM, audio, clock, or randomness outside a seeded generator
- `content/`: fighter, move, stage, dialogue and animation data
- `input/`: keyboard, Gamepad API, remapping and input history
- `render/`: Canvas/WebGL rendering and animation interpolation
- `audio/`: music, voice and sound buses
- `modes/`: title, selection, training, story, local versus and online versus
- `net/`: transport, rollback/prediction, resynchronization and replay exchange
- `ui/`: accessible DOM overlays and menus

The renderer may interpolate at the display refresh rate, while combat remains fixed at 60 simulation frames per second. Sprite source animation rate and simulation rate are separate concerns.

## Online match model

The recommended starting design is peer input exchange with a trusted match coordinator, rollback prediction, periodic state hashes, and an append-only signed result record. Pure client-reported wins are not acceptable for ranked play. If abuse testing shows that transcript verification is insufficient, move ranked simulation to an authoritative relay/server without changing the deterministic core.

WebSocket signaling/relay is the broad-compatibility baseline. WebRTC data channels can later reduce relay latency where connectivity permits, with WebSocket fallback.

## Non-functional budgets

| Area | Initial budget |
| --- | --- |
| Combat simulation | 60 Hz, deterministic for identical inputs |
| Render | 60 fps at 1080p on the agreed minimum device |
| Input | Sample every simulation frame; controller mapping persisted locally |
| Network | Ranked match warns above 120 ms RTT; region filter available |
| Rollback | Tune from playtests; instrument average and worst rollback depth |
| Initial download | Establish after asset audit; load menu before full match content |
| Availability | Define service-level objective before ranked beta |

## Security and privacy boundaries

- The client never receives database credentials or ranking write authority.
- Match result submission is idempotent and tied to a server-issued session.
- Store the minimum personal data needed for identity and moderation.
- Separate public profile data from operational and disciplinary records.
- Define retention and deletion behavior before public account creation.
- Treat replays and chat/player names as user-generated content.

## Decision gates

ADRs are required before choosing the framework, backend host, identity provider, transport/rollback implementation, datastore, telemetry provider, and asset delivery strategy.
