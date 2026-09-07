# M01 asset manifest

M1 is primarily an architecture milestone. No canonical visual or audio replacement is approved by creating this packet.

Any asset added or regenerated during M1 must record:

- source and creator
- rights/provenance
- canonical and runtime paths
- transformation command
- SHA-256 update
- approving issue and pull request
- rollback target

## Canonical-content slice

PR #8 changed no visual or audio binaries. Its fighter definitions point to the
existing B01 canonical/runtime assets, and the post-merge check reproduced all
138 recorded SHA-256 hashes without modification.

PR #10 also changed no visual or audio binaries. Its post-merge verification
reproduced the same 138 hashes without modification.
