# ChatGPT Codex Instructions

## 1. Interaction Guidelines

- **Issue Tracking:** I use `beads` (bd). If I ask "what next?", suggest running `bd ready`.
- **Stack:** Next.js (App Router), Supabase, Tailwind CSS.

## 2. Coding Standards

- **Formatting:** Format all code using Prettier patterns.
- **Styling:** Use Tailwind CSS classes exclusively. No inline styles.
- **Strictness:** Use strict TypeScript types.

## 3. Issue Tracking

This project uses **bd (beads)** for issue tracking.
Run `bd prime` for workflow context.

**Quick reference:**

- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd close <id>` - Complete work
- `bd sync` - Sync with git (run at session end)

## 4. UI Design Source

- **Figma Reference:** This project relies on a Figma file for design inspiration.
- **Action:** If I ask for UI code, use the Figma MCP server to get the landing page design and design other components in a way that match the styling of the landing page example.

## 5. UI Validation Requirements (Chrome DevTools)

_(See standard project definition below)_

**CRITICAL**: All UI changes must be validated end-to-end using Chrome DevTools before a task can be considered complete.

### Validation Process

For any task that impacts the UI:

1. **Launch the application**: Run `npm run dev`
2. **Use Chrome DevTools MCP tools** to interact with and validate the UI:
    - `mcp__chrome-devtools__take_snapshot` - Capture page state
    - `mcp__chrome-devtools__take_screenshot` - Visual verification
    - `mcp__chrome-devtools__click` - Test interactive elements
    - `mcp__chrome-devtools__fill` - Test form inputs
    - `mcp__chrome-devtools__list_console_messages` - Check for errors
    - `mcp__chrome-devtools__list_network_requests` - Verify API calls

3. **Verify the following**:
    - Page renders without console errors
    - All interactive elements are functional
    - Data displays correctly
    - Navigation flows work as expected
    - Form submissions produce correct results

4. **Document validation**: Note in the task completion that UI was validated via Chrome DevTools

### Exclusions

UI validation is NOT required for:

- Backend-only tasks (API routes, database migrations)
- Documentation-only tasks
- Schema/configuration file tasks

### Failure Protocol

If Chrome DevTools validation reveals issues:

1. Do NOT mark the task as complete
2. Fix the identified issues
3. Re-run validation
4. Only mark complete when all validations pass

## 6. Development Philosophy (Martin Fowler)

_(See standard project definition below)_

This project follows Martin Fowler's software development principles:

### Core Principles

- **Refactoring** - Continuously improve code structure without changing behavior. Never let code rot; leave it cleaner than you found it.
- **YAGNI (You Ain't Gonna Need It)** - Don't build features until they're actually needed. Avoid speculative generality.
- **Evolutionary Design** - Let design emerge through iterative development rather than big upfront design. Respond to actual requirements, not hypothetical ones.
- **Small Incremental Changes** - Prefer many small, reversible changes over large rewrites. Each change should be independently deployable and testable.

### Testing Practices

- **Test-Driven Development (TDD)** - Write failing tests first, then implement just enough code to pass, then refactor. Red-Green-Refactor cycle.
- **Self-Testing Code** - All production code should have comprehensive automated tests. Tests are first-class citizens.
- **Continuous Integration** - Integrate and test changes frequently. Never leave the build broken.

### Code Quality

- **Code Smells** - Recognize and address problematic patterns (long methods, duplicate code, feature envy, etc.) through refactoring.
- **Clean Code** - Write code for humans first, computers second. Favor clarity over cleverness.
- **Single Responsibility** - Each module, class, and function should have one reason to change.
- **Meaningful Names** - Names should reveal intent. Avoid abbreviations and cryptic identifiers.

### Design Guidance

- **Domain-Driven Design** - Use ubiquitous language that matches the business domain. Code should read like the problem it solves.
- **Minimize Dependencies** - Reduce coupling between modules. Depend on abstractions, not concretions.
- **Strangler Fig Pattern** - When modernizing legacy code, gradually replace components rather than rewriting everything at once.

### Practical Application

When implementing features:

1. Start with the simplest thing that could possibly work
2. Write a test that defines the expected behavior
3. Implement just enough to pass the test
4. Refactor to improve structure while keeping tests green
5. Commit frequently with meaningful messages

## 7. Architecture

See `docs/PRD.md` and `docs/SCHEMA.md` for system definitions.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
