# ADR 0001: Shared Git becomes the collaboration source

- Status: accepted
- Date: 2026-09-06
- Owners: Project owner; engineering lead to be assigned

## Context

The prototype is stored in an internal Git remote managed by ChatGPT Sites. It supports source versioning and deployment, but it is not the intended surface for external programmers to open issues, propose branches, review pull requests and discuss changes.

## Decision

Use `https://github.com/CesarBallon/MMCHFGHTR` as the shared collaboration repository, beginning with a fresh B01 root commit that contains only the approved baseline. Keep the existing Sites repository as the hosting/release lineage and preserve its complete pre-baseline history in an independently stored, checksum-verified Git bundle.

## Alternatives considered

- Keep Sites as the only remote: lowest setup effort, insufficient collaboration workflow.
- Mirror the full Sites history into GitHub: simple lineage, but stores every superseded binary and conflicts with the approved clean-baseline requirement.
- Start a new repository with one baseline commit and no external backup: smaller clone, but loses recoverability of the evolution history.
- Rewrite all binaries into Git LFS immediately: may reduce future Git growth, but changes every affected commit and complicates the first migration.

## Consequences

Pull requests, issue templates, reviews, branch rules and team ownership become available without carrying prototype binaries into GitHub. GitHub and Sites have separate histories and must be coordinated through documented releases until deployment automation is implemented. The prototype bundle is immutable recovery material, not an active development remote.

## Validation and rollback

Clone the GitHub repository into a clean directory, run `npm test`, verify the B01 tag/commit and package the static site. If validation fails, the Sites repository and the separately stored prototype bundle remain recovery sources.
