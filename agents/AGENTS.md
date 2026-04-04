# Agents Directory Guide

`agents/` is the **working memory** for people and agents on this project. It separates **stable intent** from **execution state** so context stays in one place, plans stay consistent, and the same facts are not rewritten in multiple files.

**At a glance**

- **What to read first:** this file, then `README.md` / `CLAUDE.md`, then `ROADMAP.md`.
- **Where truth lives:** scope in `REQUIREMENTS.md`, shape in `ARCHITECTURE.md`; progress in `ROADMAP.md` + `tasks/`, not as a substitute for those.
- **How work is traced:** Requirement → Epic → Story → Task → test or verification evidence.

Runtime, dependency, and command conventions live in the repo root (`README.md`, `CLAUDE.md`). **Do not duplicate them here** unless a task directly depends on that detail.

---

## What `agents/` answers

1. What does the project need?
2. How should it be built?
3. What is the overall progress?
4. How is work grouped into epics?
5. How is each epic broken into stories?
6. What tasks should run next?

---

## Document map

| Path | Owns | Does not own |
| --- | --- | --- |
| `AGENTS.md` | Entry point: reading order, boundaries, IDs, workflows | Product requirements, architecture detail, per-task implementation notes |
| `REQUIREMENTS.md` | Scope, constraints, acceptance boundaries, non-goals | Task progress, sequencing, low-level design |
| `ARCHITECTURE.md` | Technical approach, module boundaries, data flow, major decisions | Business scope, task tracking, story acceptance status |
| `ROADMAP.md` | Active epics/stories, blockers, next focus, rolled-up status | Full spec of every task or requirement |
| `stories/` | Epic and story docs: planning boundaries and **acceptance criteria** | Execution logs, global status |
| `tasks/` | Executable tasks; how tests verify story acceptance | Long product or architecture essays |

**Templates:** use `agents/stories/_epic_template.md`, `agents/stories/_story_template.md`, and `agents/tasks/_template.md` when creating new planning artifacts.

**Tests (see `agents/ARCHITECTURE.md` §5):**

- Unit: `*.spec.ts` next to source under `src/`; no `__tests__/` folders; no unit tests for `src/boot.ts` or `src/hono.ts`.
- Integration: `test/intg/**/*.intg.spec.ts` (`.spec` required for Bun discovery).
- E2E: `test/e2e/**/*.e2e.spec.ts`.

---

## Language policy

- `REQUIREMENTS.md`, `ARCHITECTURE.md`, and `ROADMAP.md` **must** stay in **Chinese**.
- Other files under `agents/` default to **English** (including this file).
- Keep one language per file unless there is a strong reason to mix.

---

## Traceability chain

Work follows:

`Requirement → Epic → Story → Task → test evidence`

| Rule | Detail |
| --- | --- |
| Breakdown | Requirements split into one or more epics; each story belongs to exactly one epic |
| Stories | Must have explicit, testable acceptance criteria |
| Tasks | Each task belongs to exactly one story and states how verification maps to those criteria |
| `ROADMAP.md` | Summarizes status; it is **not** the source of truth for full epic/story/task content |

**Layering (stability vs. churn):** documents closer to execution may be more specific and short-lived. Documents closer to project intent should stay more stable.

---

## ID and file naming

IDs must encode type and parent relationship.

| Kind | Pattern | Example |
| --- | --- | --- |
| Epic | `EP-NNN` | `EP-001` |
| Story | `ST-NNN-MM` (story MM under epic NNN) | `ST-001-01` |
| Task | `TK-NNN-MM-KK` (task KK under story `ST-NNN-MM`) | `TK-001-01-01` |

**Recommended filenames**

- `stories/EP-001-auth-foundation.md`
- `stories/ST-001-01-create-access-token-flow.md`
- `tasks/TK-001-01-01-add-token-service.md`

---

## Reading order

**Default sequence**

1. `agents/AGENTS.md` (this file)
2. `README.md`
3. `CLAUDE.md`
4. `agents/ROADMAP.md`
5. `agents/REQUIREMENTS.md`
6. `agents/ARCHITECTURE.md`
7. Relevant epic → story → task under `agents/stories/` and `agents/tasks/`

**Shortcuts**

- Mostly technical work: after `ROADMAP.md`, you may jump to `ARCHITECTURE.md` before deep-diving requirements.
- New or unclear product scope: read `REQUIREMENTS.md` before tasks.

---

## Workflows

### New feature or change request

1. Update `REQUIREMENTS.md` if scope, acceptance, or constraints changed.
2. Update `ARCHITECTURE.md` if system shape or boundaries changed.
3. Add an epic under `stories/`, then stories, then tasks under `tasks/`.
4. Update `ROADMAP.md` with active epic/story, task status, and blockers.

### Executing existing work

1. Start from `ROADMAP.md` for priority.
2. Open the linked epic, story, and task.
3. Implement; update **`tasks/` first**, then roll status into `ROADMAP.md`.

---

## Change policy (completed work)

Epics and stories marked **done** are **historical records**.

- Do not repurpose a completed epic or story to mean new scope or new behavior.
- Follow-up work gets **new** epic/story IDs and links such as `Follow-up to`, `Supersedes`, or `Related to`.

**Tasks** may change while active. After a task is done, add a **new** task for follow-ups instead of redefining the completed one.

---

## Maintenance

- **Single source of truth:** each fact has one primary home; link elsewhere instead of copying.
- **Stable vs. moving:** stable truth in `REQUIREMENTS.md` or `ARCHITECTURE.md`; execution state in `ROADMAP.md` and `tasks/`.
- **Clarity before edits:** if a requirement or rule is not clear in `agents/`, confirm it before changing code or docs.
- **Scope of files:** epics = planning and boundaries; stories = intent and acceptance criteria; tasks = actionable steps and verification.
- **Traceability:** story acceptance criteria must map to task tests or verification steps.

---

## Quick lookup

| I need… | Open |
| --- | --- |
| Current focus and blockers | `ROADMAP.md` |
| Why something exists | `REQUIREMENTS.md` |
| How it fits the system | `ARCHITECTURE.md` |
| What to implement next | Linked story + tasks from `ROADMAP.md` |
| To plan new work | New epic, then stories (then tasks) |

Start with this file, then follow the default reading order above.
