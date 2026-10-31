---
description: Record a booking request with one or more instances and required versions.
---
# book

Record a booking request with one or more instances and required versions.

Run from this repo:

```sh
npm run environments -- book --name="<name>" --project="<project>" --owner="<owner>" --purpose=regression --start="<ISO timestamp>" --end="<ISO timestamp>" --resources='[{"instance":"<name or id>","version":"<version>"}]' --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




