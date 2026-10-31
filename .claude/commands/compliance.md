---
description: Check recorded evidence and retention review dates against the documented rules.
---
# compliance

Check recorded evidence and retention review dates against the documented rules.

Run from this repo:

```sh
npm run environments -- compliance
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.


Read docs/compliance.md. Evidence checks do not inspect the real environment or certify compliance. Never claim a live probe ran.

