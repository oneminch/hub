# Agent Configuration & Project Context

This file details the conventions, workflows, architectural context, and technical stack that AI agents should follow when contributing to this codebase.

## Project Background

- **Project Name**: Issue Hub
- **Purpose**: A personal productivity utility built to aggregate issues across multiple GitHub organizations and repositories.
- **How It Works**:
  - The user inputs one or more GitHub organizations.
  - The app queries public repositories for those organizations via the ungh.cc API.
  - Repositories are filtered to exclude archived repositories, sorted descending by star count, and grouped by organization.
  - Results are paginated (10 per page) with a simple client-side "Load More" action.
  - The user checks/unchecks individual repositories.
  - A sticky floating action bar displays the total selected count and offers a "Generate & Copy Link" action.
  - This generates a single combined GitHub issues search query (e.g., `repo:org1/repo1 repo:org1/repo2 is:issue is:open`) and copies it directly to the clipboard.

## Technology Stack

- **Framework**: **Nuxt 4** (using the new default directory structure where application code resides inside `app/` and root folders are dedicated to shared server/config assets).
- **UI Components**: **Nuxt UI v3/v4** and **Tailwind CSS**.
- **Data Source API**: **ungh.cc** by Unjs. Provides unlimited, unauthenticated read access to public GitHub organization repositories via `GET https://ungh.cc/orgs/{org}/repos`.
- **Testing**: **Vitest** + **@nuxt/test-utils** + **happy-dom**.

## Core Codebase Conventions

- **Directory Structure**:
  - All Vue components, pages, composables, and layouts are inside `app/` (`srcDir`).
  - Custom composables live in `app/composables/` (e.g., `app/composables/use-issue-hub.ts`).
  - General utilities live in `app/utils/` (e.g., `app/utils/link-builder.ts`).
  - Shared types live in `app/utils/types.ts`.
- **Naming Conventions**: Use **kebab-case** for all file and folder names (e.g. `use-issue-hub.ts`, `link-builder.ts`).
- **Imports**: Utilize Nuxt 4's powerful auto-import capability. Types should be explicitly imported from `~/utils/types` or `#imports` if needed, but general composables and utilities do not require manual imports.

## Agent Workflows

### Issue Tracker

Issues and tasks are tracked directly in `docs/agents/issue-tracker.md`.

### Domain Docs

Single-context layout (using CONTEXT.md at root). See `docs/agents/domain.md`.
