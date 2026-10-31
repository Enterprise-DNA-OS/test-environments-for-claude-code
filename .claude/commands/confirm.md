---
description: Confirm a requested booking only on an explicit operator instruction. Check readiness and clashes first.
---
# confirm

Confirm a requested booking only on an explicit operator instruction. Check readiness and clashes first.

Run from this repo:

```sh
npm run environments -- confirm --booking="<name or id>" --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.


Read docs/compliance.md. Evidence checks do not inspect the real environment or certify compliance. Never claim a live probe ran.

