# Test Environments for Claude Code

Keep test-environment bookings, version requirements, readiness evidence and handovers in a database you own. Ask which projects clash, which versions differ, and who needs to act before testing can start.

## Three ways to own it

- **Do it yourself:** install the MIT-licensed base, import your instance register and operate it with Claude Code, Codex, OpenCode or Cursor. Hosting and your coding agent are separate costs.
- **We customise it:** Enterprise DNA maps your Enov8 records, adds your fields and rules, connects your delivery tools, and builds a web front end or a different stack when needed. One setup fee, then a retainer for ongoing work.
- **We run it for you:** Omni by Enterprise DNA installs it, manages access and backups, prepares reviews and keeps it working. One setup fee, then a retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=enov8).

## Start with the synthetic demo

Node 20 or newer. No cloud account is needed for the embedded database.

```sh
npm install
npm test
npm run demo
npm run environments -- conflicts
npm run environments -- readiness --json
npm run view
npm run docs
```

The demo has four instances, two clashing reservations, a version mismatch, stale evidence and overdue work. It uses invented businesses and people. Seeding is repeatable and does not reset edited records. Use a fresh DATA_DIR for real data. DATABASE_URL selects PostgreSQL, otherwise PGlite persists under .data/db. Never commit either.

## What it does

The instance register links systems, environment groups and owners. Bookings reserve one or more instances with explicit versions. Requested bookings can overlap so demand remains visible. Confirmation locks the relevant instance records and rejects overlapping confirmed bookings. Time windows use UTC instants and are half-open: one booking can start exactly when another ends.

A booking cannot be confirmed without current evidence that lasts through its end, the requested versions, recorded healthy status, synthetic or masked test data and no open blockers. Later evidence can make a confirmed booking unready. Read readiness again before starting work. This checks records only: it does not contact environments, verify masking or execute a release. The operator remains responsible for source evidence.

Imports, checks and activity are append-only through database triggers. Instance metadata and booking states remain operational records. Actor labels are not authentication and a database owner can bypass controls. This is a trusted local operator tool, not a multi-tenant service.

## Recurring jobs

- `/instances`: List the environment instances, owners and recorded readiness.
- `/bookings`: Read booking windows, projects, owners and status.
- `/booking`: Read the named booking, all its resource requirements and clashes.
- `/conflicts`: Find overlapping open bookings on the same instance.
- `/readiness`: Review the evidence and versions required for open bookings.
- `/drift`: Find requested versions that differ from recorded evidence.
- `/overdue`: Read overdue issues, unconfirmed starts and unfinished handovers.
- `/compliance`: Check recorded evidence and retention review dates against the documented rules.
- `/issues`: Read open and closed follow-up work.
- `/demand`: Count future open bookings by instance.
- `/idle`: Find active instances with no open booking in the next 30 days.
- `/activity`: Read the append-only activity record.
- `/available`: Find ready instances without any requested or confirmed booking in a window.
- `/add-instance`: Add an instance with a known system, group and owner.
- `/book`: Record a booking request with one or more instances and required versions.
- `/check`: Record fresh test evidence. Read the source report before recording a version, health or data classification.
- `/log-issue`: Log an issue and its responsible owner. Blocking defaults to yes.
- `/close-issue`: Close a named issue only after the operator provides its resolution.
- `/confirm`: Confirm a requested booking only on an explicit operator instruction. Check readiness and clashes first.
- `/close-booking`: Record completion with the test result, reset work and next owner, or cancel with a reason.
- `/import`: Read docs/replace-enov8.md, inspect the headers and reconcile counts. Test first, then import on the operator instruction.
- `/export`: Export every record and the original imported CSV to a new private file.
- `/weekly-review`: Draft the Monday review from readiness, conflicts and overdue work.
- `/draft-handover`: Read the named booking and write its handover draft.
- `/help`: Show available commands and flags.
- /customise: add fields and change rules with a tested migration.
- /new-view: add a read-only report in the same brand.

All CLI commands support --json. Flags use --name=value. PowerShell users can put JSON resource arguments in a variable before passing them as one argument. Run npm run environments -- help for accepted flags.

## Ten questions to ask your own records

1. Which project pairs are competing for the same environment window? (`conflicts`)
2. Which booked instances have the wrong recorded version? (`drift`)
3. Which bookings outlast the validity of their readiness evidence? (`readiness`)
4. Which test environments still have personal or unclassified data? (`compliance`)
5. Who owns the blockers preventing an environment handover? (`issues`)
6. Which booking confirmations and handovers are overdue? (`overdue`)
7. Which ready instances are free for our next rehearsal? (`available --start="<start>" --end="<end>"`)
8. Which instances have no booking in the next month? (`idle`)
9. Where is future booking demand concentrated? (`demand`)
10. Who recorded each readiness check and booking decision? (`activity`)

These are supported analyses, not an assertion that Enov8 cannot produce them. Your own evidence rules and cross-project history determine what makes each answer useful.

## Your first hour: ten things to ask for

1. Put our name, logo and colours in brand.json.
2. Show all overlapping bookings and their owners.
3. Compare requested versions with recorded versions.
4. Show evidence that expires before a booking ends.
5. Draft Monday review from readiness, conflicts and overdue work.
6. Find a free rehearsal window on a ready instance.
7. Test an import of our Enov8 instance download.
8. Record a fresh masking or synthetic-data check from our evidence.
9. Add a reset-owner field with a tested migration.
10. Export a complete private snapshot before changing a rule.

## Switching from Enov8

Read [the replace guide](docs/replace-enov8.md). One command imports the documented environment-instance CSV fields, preserves all other columns and the original file, and rejects silent overwrites. It does not turn exported status into a fresh readiness check. Reconcile a real account export before switching. Booking history, components, dependencies, diagrams, automations and integrations need separate mapping. Enterprise DNA can bring these into your version.

## Branded documents and read-only views

Edit brand.json for your business name, logo and colours. npm run docs produces booking briefs, handover drafts and evidence reviews from the records. npm run view produces the week, readiness and attention dashboards. weekly-review and draft-handover write private Markdown drafts. No command sends or publishes. Print HTML to PDF when a document needs signing or filing.

[Why no front end](docs/why-no-front-end.md) explains where a screen adds value. [Compliance](docs/compliance.md) separates implemented record checks from the rules they support. [Research](docs/research.md) records the price evidence, selection scores and scope.

## Verification and operations

npm test uses a temporary database and output directory. It exercises every CLI command, repeatable seeding, atomic imports, clash and evidence gates, ambiguous names, dates, exports, document rendering and HTML escaping. CI tests Node 20 and 22 on Windows and Ubuntu and PostgreSQL 16 on Ubuntu. Report observed results separately from configured checks. TEST_DATABASE_URL must reference an empty disposable database.

The tables have row-level security and no PUBLIC privileges. Use a trusted database owner for the CLI. Production multi-user authentication, access boundaries and hosting need a separate deployment design. Export snapshots include original imports and activity; use native database backups as well. Drafts and exports contain business data.

## Licence

MIT. Copyright 2026 Enterprise DNA. Enov8 is the incumbent's product name. This project is independent and does not copy its code or assets.
