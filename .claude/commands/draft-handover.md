---
description: Read the named booking and write its handover draft.
---
# draft-handover

Read the named booking and write its handover draft.

Run from this repo:

```sh
npm run environments -- draft-handover --booking="<name or id>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.



Return the generated draft path and main findings here. Nothing sends or publishes.
