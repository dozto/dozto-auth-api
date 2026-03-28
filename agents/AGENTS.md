# Agents Directory Guide

This directory is the working memory for agents operating on this project.
It separates stable context from execution state so agents can understand the
project quickly, plan work consistently, and avoid rewriting the same context
in multiple places.

## Directory Purpose

Use `agents/` to answer six questions:

1. What does the project need?
2. How should it be built?
3. What is the current overall progress?
4. How is the work grouped into epics?
5. How is each epic broken down into stories?
6. What concrete tasks should be executed next?

This directory is intentionally lightweight. Runtime, dependency, and command
conventions already live in the repository root docs, especially `README.md`
and `CLAUDE.md`. Do not duplicate that information here unless a task depends
on it directly.

## File Responsibilities

| Path | Responsibility | Does not own |
| --- | --- | --- |
| `AGENTS.md` | Entry point for agents. Explains reading order, document boundaries, ID conventions, and update workflow. | Detailed product requirements, architecture details, or task-by-task implementation notes. |
| `REQUIREMENTS.md` | Source of truth for scope, constraints, acceptance boundaries, and non-goals. | Task progress, implementation sequencing, or low-level technical design. |
| `ARCHITECTURE.md` | Source of truth for technical approach, module boundaries, data flow, and major design decisions. | Business scope, detailed task tracking, or story acceptance status. |
| `ROADMAP.md` | Top-level task tracker. Summarizes active epics, active stories, blockers, next focus, and cross-task status. | Full task detail for every item or the complete requirement specification. |
| `stories/` | Houses epic and story documents. Epics define larger work streams. Stories define implementable requirement slices with acceptance criteria. | Detailed execution logs or the global project status. |
| `tasks/` | Houses executable work items. Each task belongs to exactly one story and should explain how its tests validate story acceptance criteria. | Long-form product context or architecture rationale. |

## Language Policy

- `agents/REQUIREMENTS.md`, `agents/ARCHITECTURE.md`, and `agents/ROADMAP.md` must be maintained in Chinese.
- Other files under `agents/` should be maintained in English by default.
- When adding new content, keep the language of the target file consistent instead of mixing Chinese and English in the same document unless there is a strong reason.

## Hierarchy And Traceability

Work must follow this chain:

`Requirement -> Epic -> Story -> Task -> Test evidence`

Rules:

- A requirement is first broken down into one or more epics.
- Each story belongs to exactly one epic.
- Each story must include explicit acceptance criteria.
- Each task belongs to exactly one story.
- Each task must state how its tests or verification steps map back to the
  story acceptance criteria.
- `ROADMAP.md` rolls up status from epics, stories, and tasks, but it is not
  the source of truth for their full content.

## ID Convention

IDs must make type and parent relationship obvious.

- Epic: `EP-001`
- Story: `ST-001-01`
- Task: `TK-001-01-01`

Meaning:

- `EP-001` is epic 1.
- `ST-001-01` is story 1 under epic 1.
- `TK-001-01-01` is task 1 under story 1 under epic 1.

Recommended file naming:

- `stories/EP-001-auth-foundation.md`
- `stories/ST-001-01-create-access-token-flow.md`
- `tasks/TK-001-01-01-add-token-service.md`

## Recommended Reading Order

Agents should read documents in this order:

1. `agents/AGENTS.md`
2. `README.md`
3. `CLAUDE.md`
4. `agents/ROADMAP.md`
5. `agents/REQUIREMENTS.md`
6. `agents/ARCHITECTURE.md`
7. The relevant epic in `agents/stories/`
8. The relevant story in `agents/stories/`
9. The relevant task in `agents/tasks/`

Use this order as a default. If the task is purely technical, jump from
`ROADMAP.md` to `ARCHITECTURE.md` earlier. If the task starts from a new
feature request, read `REQUIREMENTS.md` before looking at tasks.

## Working Model

Treat the documents as layered context:

- `REQUIREMENTS.md` defines what must be true.
- `ARCHITECTURE.md` defines how the system should be shaped.
- `ROADMAP.md` defines what is currently being worked on and what is blocked.
- Epics define larger work streams and planning boundaries.
- Stories define requirement slices and acceptance criteria.
- Tasks define concrete execution units.

The closer a document is to execution, the more specific and short-lived it can
be. The closer it is to project intent, the more stable it should remain.

## Update Workflow

When a new feature or change request arrives:

1. Update `REQUIREMENTS.md` if scope, acceptance boundaries, or constraints changed.
2. Update `ARCHITECTURE.md` if the technical shape or system boundaries changed.
3. Create a new epic in `stories/` for the work stream.
4. Break the epic into one or more stories in `stories/`.
5. Break each story into executable tasks in `tasks/`.
6. Reflect active epic, active story, task status, and blockers in `ROADMAP.md`.

When executing existing work:

1. Start from `ROADMAP.md` to identify the current priority.
2. Read the linked epic, story, and task documents.
3. Perform the work.
4. Update `tasks/` first, then roll up the summary into `ROADMAP.md`.

## Change Policy

Completed epics and completed stories are historical records.

- Do not rewrite a completed epic to represent new scope.
- Do not rewrite a completed story to represent changed behavior.
- If new or changed work is needed after completion, create a new epic and new
  story IDs for that change.
- Link follow-up work back to the previous epic or story using references such
  as `Follow-up to`, `Supersedes`, or `Related to`.

Tasks may continue to update while work is active because they track execution
state. Once a task is done, prefer creating a new task for follow-up work
instead of changing the meaning of the completed one.

## Maintenance Rules

- Keep each fact in one primary place.
- Prefer linking to another document over copying its contents.
- Put stable truth in `REQUIREMENTS.md` or `ARCHITECTURE.md`.
- If a file update or code change depends on a problem, requirement, or rule that is not described clearly in `agents/`, confirm it first before making the update.
- Put changing execution state in `ROADMAP.md` and `tasks/`.
- Keep epic files focused on planning context and scope.
- Keep story files focused on intent and acceptance criteria.
- Keep tasks actionable; if a task becomes too large, split it.
- Make acceptance criteria traceable from story to task verification.

## Practical Guidance

- If an agent needs project context, start here and then follow the reading order.
- If an agent needs current execution status, open `ROADMAP.md`.
- If an agent needs to understand why a change exists, open `REQUIREMENTS.md`.
- If an agent needs to understand how a change fits the system, open `ARCHITECTURE.md`.
- If an agent needs to plan new work, create an epic first, then create stories.
- If an agent needs to do work, use the story and task documents as the execution layer.
