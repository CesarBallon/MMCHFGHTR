# Milestone documentation process

Every major milestone is a traceable release, not merely a commit message.

## Required milestone packet

Create `docs/milestones/MNN-short-name/` from the template. A milestone cannot be marked complete until it contains:

1. `README.md` — goal, scope, owner, dates and exit-criteria result
2. `CHANGELOG.md` — player-visible and developer-visible changes
3. `TEST_REPORT.md` — automated/manual tests, devices, browsers and known failures
4. `ASSET_MANIFEST.md` — added/replaced canonical art, atlases, stages, music, SFX and licenses/provenance
5. `RELEASE_NOTES.md` — concise external summary and migration notes
6. Links to relevant ADRs, issues, pull requests and build/deployment IDs
7. A rollback target: previous tag or saved Site version
8. A short retrospective: what changed in the next milestone because of what was learned

## Git and release convention

- Issues define work; pull requests implement it.
- Use short-lived branches such as `feature/training-hitboxes` or `content/saja-route`.
- Merge only after validation and review.
- Keep `main` playable and releasable.
- Tag completed milestones as `m0`, `m1`, and so on; patch releases use `m1.1`.
- Add every player-visible change to the root `CHANGELOG.md` under `Unreleased`.
- A Site version records an exact pushed commit. Production deployment remains a separate, deliberate action.

## Definition of done for any feature

- Acceptance criteria pass.
- Automated coverage is added where deterministic behavior can be tested.
- Controller and keyboard paths are checked when input changes.
- Animation, audio, performance and accessibility are checked when applicable.
- Data/schema changes include forward and rollback notes.
- Documentation and changelog are updated in the same pull request.
- No temporary, generated-debug, or unapproved canonical asset files are committed.
