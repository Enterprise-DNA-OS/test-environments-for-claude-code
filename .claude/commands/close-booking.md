---
description: Record completion with the test result, reset work and next owner, or cancel with a reason.
---
# close-booking

Record completion with the test result, reset work and next owner, or cancel with a reason.

Run from this repo:

```sh
npm run environments -- close-booking --booking="<name or id>" --status=completed --resolution="<result and handover>" --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




