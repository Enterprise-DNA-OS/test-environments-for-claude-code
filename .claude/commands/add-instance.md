---
description: Add an instance with a known system, group and owner.
---
# add-instance

Add an instance with a known system, group and owner.

Run from this repo:

```sh
npm run environments -- add-instance --name="<name>" --system="<system>" --group="<group>" --owner="<owner>" --actor="<operator>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.




