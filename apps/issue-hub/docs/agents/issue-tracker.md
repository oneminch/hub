# Issue Tracker

Issues and tasks for this repository are tracked directly in this file.

## Conventions

- Tasks are tracked under ## Active Backlog.
- Use markdown checkboxes: `[ ]` for pending, `[ ]` (or notes) for in-progress, and `[x]` for completed.
- To create a new ticket, append it to the backlog.

## Active Backlog

### Phase 1: Project Setup & Test Setup
- [x] Install `vitest` and `@nuxt/test-utils` for testing
- [x] Add basic test runner scripts to `package.json`

### Phase 2: Link Builder Utility
- [x] Implement `app/utils/link-builder.ts` for constructing the search URL
- [x] Write unit tests for `link-builder.ts` to verify correct query formatting and URL encoding

### Phase 3: Composable for State & Fetching
- [x] Implement `app/composables/use-issue-hub.ts`
- [x] Write integration tests for `use-issue-hub.ts` mocking the ungh.cc API

### Phase 4: UI Development & Integration
- [x] Build `app/pages/index.vue` with Nuxt UI (grouped list, checkboxes, "Load more")
- [x] Add toast notifications on successful clipboard copy

### Phase 5: Polish & Validation
- [x] Add loading, empty, and error states
- [x] Verify lint, typecheck, and all test suites pass

### Phase 6: Global Search Migration
- [x] Migrate search URL path from `/issues` to global `/search` page

### Spec v1.1: Usability and Performance Improvements [ready-for-agent]
- [ ] Theme and Layout Modernization (lime/neutral color config, minimalist layout, floating color-mode button)
- [ ] Expand State & Types (Add allRepoNames to OrgState and populate on fetch)
- [ ] Smart Query Optimization (Rewrite buildGithubSearchUrl with dynamic inclusion/exclusion logic and sort parameter)
- [ ] UI Integration (Add creation date sorting dropdown in the sticky bar and connect states)
- [ ] Update link builder so that Issues created by apps/bots like renovate and dependabot must be excluded

