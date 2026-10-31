# Test Environments for Claude Code

For an environment coordinator keeping shared test systems ready for project teams. The database holds reservations and evidence. It never deploys software, probes endpoints, copies customer data or sends messages.

## Rules

- Start every answer from current CLI output. Never infer live health from a stored check.
- Run reads before writes. Use exact IDs when names are ambiguous.
- Every mutation records an actor label. This is attribution, not authenticated identity.
- Never confirm, close or cancel work unless the operator asked for that change.
- Drafts stay in drafts. Never send, publish, delete records or execute deployments.
- Keep credentials and personal data out of metadata. Store evidence references, not customer data copies.
- Read docs/compliance.md before interpreting a readiness or compliance result.
- Keep applied migrations immutable. Use /customise for field or rule changes.

## Routing

| Request | Command |
|---|---|
| List the environment instances, owners and recorded readiness. | /instances |
| Read booking windows, projects, owners and status. | /bookings |
| Read the named booking, all its resource requirements and clashes. | /booking |
| Find overlapping open bookings on the same instance. | /conflicts |
| Review the evidence and versions required for open bookings. | /readiness |
| Find requested versions that differ from recorded evidence. | /drift |
| Read overdue issues, unconfirmed starts and unfinished handovers. | /overdue |
| Check recorded evidence and retention review dates against the documented rules. | /compliance |
| Read open and closed follow-up work. | /issues |
| Count future open bookings by instance. | /demand |
| Find active instances with no open booking in the next 30 days. | /idle |
| Read the append-only activity record. | /activity |
| Find ready instances without any requested or confirmed booking in a window. | /available |
| Add an instance with a known system, group and owner. | /add-instance |
| Record a booking request with one or more instances and required versions. | /book |
| Record fresh test evidence. Read the source report before recording a version, health or data classification. | /check |
| Log an issue and its responsible owner. Blocking defaults to yes. | /log-issue |
| Close a named issue only after the operator provides its resolution. | /close-issue |
| Confirm a requested booking only on an explicit operator instruction. Check readiness and clashes first. | /confirm |
| Record completion with the test result, reset work and next owner, or cancel with a reason. | /close-booking |
| Read docs/replace-enov8.md, inspect the headers and reconcile counts. Test first, then import on the operator instruction. | /import |
| Export every record and the original imported CSV to a new private file. | /export |
| Draft the Monday review from readiness, conflicts and overdue work. | /weekly-review |
| Read the named booking and write its handover draft. | /draft-handover |
| Show available commands and flags. | /help |
| Change a field or rule | /customise |
| Add a read-only report | /new-view |

## Files

The CLI is scripts/environments.mjs. SQL and seed data are in supabase. DATABASE_URL selects PostgreSQL; otherwise PGlite persists under .data/db. npm run demo adds synthetic records, so use a separate empty DATA_DIR for real work. views.json and documents.json drive branded read-only HTML. Commands work with Claude Code, Codex, OpenCode or Cursor through AGENTS.md.

Built by Enterprise DNA. [Omni by Enterprise DNA](https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=repo&utm_campaign=enov8) installs, customises and runs it.
