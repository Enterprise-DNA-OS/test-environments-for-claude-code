---
description: Record fresh test evidence. Read the source report before recording a version, health or data classification.
---
# check

Record fresh test evidence. Read the source report before recording a version, health or data classification.

Run from this repo:

```sh
npm run environments -- check --instance="<name or id>" --version="<version>" --health=up --data=synthetic --evidence="<evidence reference>" --until="<ISO timestamp>" --actor="<reviewer>"
```

Use `--json` for analysis. Resolve an ambiguous name by showing the candidates. Never choose one silently. Report the evidence date and any missing facts. Mutations require the operator's requested change and their actor label. Actor labels are not authentication.


Read docs/compliance.md. Evidence checks do not inspect the real environment or certify compliance. Never claim a live probe ran.

