# Shared Git baseline and release flow

## Canonical collaboration repository

`https://github.com/CesarBallon/MMCHFGHTR.git` is the shared collaboration repository beginning with baseline B01.

It intentionally starts with a fresh root commit. The pre-baseline Sites repository remains the deployment lineage and is also preserved in a complete, checksum-verified Git bundle stored outside GitHub. This ensures the GitHub repository contains only current baseline assets, not superseded binaries hidden in earlier Git objects.

## Remotes and responsibilities

| Repository | Purpose | History policy |
| --- | --- | --- |
| GitHub `CesarBallon/MMCHFGHTR` | Canonical collaboration, issues, pull requests and reviews | B01 forward only |
| ChatGPT Sites source repository | Existing hosted-site release source and rollback lineage | Full existing history retained |
| Prototype backup bundle | Offline recovery of all pre-B01 commits and assets | Immutable complete history |

Do not push the Sites history into GitHub. Do not add the GitHub repository as a mirror of the old repository.

## Contributor setup

```bash
git clone https://github.com/CesarBallon/MMCHFGHTR.git
cd MMCHFGHTR
npm test
```

Create work on short-lived branches and propose changes through pull requests. `main` should remain playable and releasable.

## Repository controls

Configure a GitHub ruleset for `main`:

- require pull requests
- require at least one approval; two for networking, ranking, security or account changes
- require the `validate` status check
- dismiss stale approvals after new commits
- require conversation resolution
- block force pushes and branch deletion
- limit bypass to the smallest maintainer group

Add `.github/CODEOWNERS` only after real maintainer/team handles have write access. Placeholder owners are deliberately avoided because GitHub ignores nonexistent or unauthorized owners.

## Release to Sites

Until automated release promotion is approved, a release maintainer should:

1. merge and tag the approved GitHub commit;
2. run validation from a clean clone;
3. apply that baseline source to the existing Sites checkout while retaining `.openai/hosting.json`;
4. push the exact source state to the Sites source remote;
5. save a Sites version; and
6. deploy only when the requested audience and release approval are explicit.

Record the GitHub commit, tag, Sites version and deployment identifier in the milestone packet.

The public GitHub repository contains `.openai/hosting.example.json`, not the live Sites manifest. The real `.openai/hosting.json` includes deployment-specific project metadata and remains only in the Sites checkout.

## Asset-history rule

GitHub must contain only canonical/source assets and current runtime exports defined by `BASELINE.md`. Raw generation results and superseded versions stay out of Git. When replacing a binary asset, reviewers must verify that the pull request does not accidentally retain both old and new copies under different paths.

If asset history begins to affect clone performance, adopt Git LFS or a separate restricted asset repository through an ADR. Any history rewrite requires a team freeze, backup and clean-clone verification.
