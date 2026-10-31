---
description: Read the named booking, all its resource requirements and clashes.
---
# booking

Read the named booking, all its resource requirements and clashes.

Run from this repo:

```sh
npm run environments -- booking --booking="<name or id>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




