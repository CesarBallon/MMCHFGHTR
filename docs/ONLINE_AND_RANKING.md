# Online play and ranking design

## Modes

- **Local versus:** current offline two-player mode; no account required.
- **Casual online:** skill-aware search with broad matching and no visible rating stakes.
- **Ranked online:** authenticated 1v1, region/ping guardrails, seasonal rating and stricter result validation.
- **Private room:** invite code or link, configurable rematch and spectator policy.
- **Training/replay:** deterministic playback from recorded inputs and match metadata.

## Network requirements

Every match is identified by an immutable session ID, build/content version, random seed, both player IDs, region, and ordered input stream. The combat core must produce the same state hash for both clients. Desyncs, disconnects and late inputs are metrics, not silent failures.

Ranked results must be accepted exactly once and only for server-created sessions. Both clients submit signed checkpoints/transcripts; the service reconciles them and flags disagreement. Repeated anomalies can temporarily restrict ranked access pending review.

## Rating recommendation

Use a simple hidden Elo implementation during internal tests, then adopt **Glicko-2** for ranked beta if match volume supports its rating-deviation model. The visible presentation can use named divisions while matchmaking uses the numeric estimate.

Initial policy to validate in beta:

- 10 placement matches per season
- provisional players matched more broadly but protected from top divisions
- soft seasonal reset rather than deleting skill history
- rating change recorded as a ledger entry, never overwritten without an audit event
- disconnect counts as a loss after a short reconnection window; mass outages are reversible by operations
- no rating change when the match service declares a server-side cancellation
- leaderboards partitioned by season and optionally by region

## Minimum records

| Record | Key fields |
| --- | --- |
| Player | ID, display name, status, created time, privacy settings |
| Season | ID, ruleset/content version, start/end, status |
| Rating | player + season, rating, deviation/uncertainty, games, updated time |
| Match | session, players, build, region, start/end, outcome, termination reason |
| Rating ledger | match, before/after for each player, algorithm version |
| Replay | match metadata, seed, compressed inputs, hashes, retention state |
| Moderation event | subject, reason code, actor, timestamps, appeal state |

## Fairness and operations

- Ranked queues use one approved gameplay/content version at a time.
- Balance patches start a new ruleset version; incompatible replays remain labeled and viewable through a compatible client when practical.
- Publish the rating rules, season dates, disconnect policy, and known incidents.
- Never use local browser storage as the system of record for ratings.
- Add rate limits, session expiry, display-name moderation and abuse reporting before public launch.

## Acceptance tests for ranked beta

1. Two remote clients complete 100 automated matches with zero unhandled desyncs.
2. Duplicate or replayed result submissions do not change ratings twice.
3. A client-modified result cannot award itself a win.
4. Disconnect, reconnect, timeout and service-cancellation paths produce the documented outcome.
5. A full rating ledger can reconstruct every leaderboard value.
