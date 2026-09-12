# Spec v1.1: Usability and Performance Improvements

## Problem Statement

The user is finding the current Issue Hub experience functional but a bit generic and visually cluttered. Additionally, the generated search URLs can become extremely long and hit browser limits (or look ugly) when many repositories are selected, and there is no way to control the order of the aggregated issues (e.g., seeing the newest issues first).

## Solution

We will introduce a series of targeted enhancements across three areas:
1. **Link Sorting**: Provide a dropdown control to let users sort the aggregated results on GitHub by issue creation date (Newest First vs. Oldest First).
2. **Modern Minimalist Layout & Style**: Declutter the UI by removing unnecessary header and footer containers, centering and positioning the color mode toggle floating in the top right of the container, and updating the color theme to use a modern `neutral` grey paired with a fresh `lime` accent.
3. **Smart Query Optimization**: Implement a smart link-builder algorithm that dynamically switches between inclusion (`repo:org/repo`) and exclusion (`org:org -repo:org/repo`) syntax per organization to generate the shortest possible GitHub search URL, referencing the total non-archived repositories list in the organization.

## User Stories

1. As a developer, I want to sort the aggregated issues by creation date when opening the link on GitHub, so that I can focus on either the most recent or the oldest issues.
2. As an Issue Hub user, I want the UI to be clean and simple without a large generic header or footer, so that the main focus remains on managing my organization repository selections.
3. As an Issue Hub user, I want the theme color palette to feel modern and professional (neutral darks/lights with a lime accent) rather than the default Nuxt green.
4. As an Issue Hub user, I want the theme toggle button to be easily accessible but positioned unobtrusively in the upper right of the main app container.
5. As a developer with many repositories under a single organization, I want the copied GitHub search link to remain as short and efficient as possible, so that it doesn't get truncated by clipboard or browser query limits.

## Implementation Decisions

### 1. Color Palette & Global Style
- Update `app/app.config.ts` to use `lime` as the `primary` color and `neutral` as the `neutral` color.
- Remove `<UHeader>`, `<USeparator>`, and `<UFooter>` from `app/app.vue`.
- Wrap the `<NuxtPage />` in `app/app.vue` with a simple `<UContainer>` with a relative layout to allow absolute positioning of elements.
- Move the `<UColorModeButton />` into `app/app.vue` inside the `<UContainer>`, positioned absolutely (`absolute top-8 right-4`).

### 2. State & API Integration (useIssueHub)
- Modify the `OrgState` interface in `app/utils/types.ts` to include `allRepoNames: string[]` which stores the full-names of all non-archived repositories fetched from ungh.cc.
- In `app/composables/use-issue-hub.ts`, when storing the response from ungh.cc, populate `allRepoNames` with the names of all non-archived repositories.

### 3. Sorting & Link Builder (link-builder)
- Define a new sorting type in `app/utils/types.ts`: `type IssueSortOrder = 'created-desc' | 'created-asc'`.
- Define an `OrgRepoSummary` interface for the link-builder input:
  ```typescript
  export interface OrgRepoSummary {
    name: string
    allRepos: string[]
  }
  ```
- Update `buildGithubSearchUrl` in `app/utils/link-builder.ts` to accept:
  - `selectedRepos: string[]`
  - `orgs: OrgRepoSummary[]`
  - `sort: IssueSortOrder`
- **Query Optimization Algorithm**:
  For each organization in `orgs`:
  - Find all selected repos belonging to this org: `selectedInOrg`.
  - If `selectedInOrg` is empty, skip this org.
  - Find all unselected repos belonging to this org (loaded or unloaded): `unselectedInOrg = org.allRepos.filter(repo => !selectedRepos.includes(repo))`.
  - Compare sizes:
    - If `selectedInOrg.length > org.allRepos.length / 2`:
      - Append `org:org.name` and `-repo:unselected-repo` for each unselected repo to the query.
    - Else:
      - Append `repo:selected-repo` for each selected repo to the query.
  - Any selected repository that does not belong to any defined active organization in `orgs` should fall back to standard inclusion syntax (`repo:fullName`).
- Append `sort:created-desc` or `sort:created-asc` based on the selected `sort` parameter.

### 4. Interactive UI Controls (index.vue)
- Add a dropdown or select menu inside the sticky bottom bar for selecting the sort order: "Newest First" (adds `sort:created-desc`) and "Oldest First" (adds `sort:created-asc`). Default should be "Newest First".
- Connect the sort state to the sticky bottom bar and feed it to the `buildGithubSearchUrl` utility.

## Testing Decisions

### Seams
We will test the system across two high-level seams:
1. **Utility Seam (`app/utils/link-builder.test.ts`)**:
   - Write comprehensive unit tests for `buildGithubSearchUrl` verifying:
     - Inclusion syntax when <= 50% of repositories are selected in an org.
     - Exclusion syntax when > 50% of repositories are selected in an org.
     - Mixing inclusion and exclusion across different organizations.
     - Correct appending of `sort:created-desc` and `sort:created-asc`.
     - Falling back to inclusion for orphan selected repos (not in any active orgs list).
2. **Composable Seam (`app/composables/use-issue-hub.test.ts`)**:
   - Update tests to assert that `allRepoNames` is correctly fetched and maintained in `OrgState` when organizations are added/removed.

## Out of Scope
- Sorting the lists of repositories within the Issue Hub UI itself (the UI continues to sort repositories descending by star count).
- Custom sort orders other than issue creation date (e.g., most commented, recently updated).

## Further Notes
None.
