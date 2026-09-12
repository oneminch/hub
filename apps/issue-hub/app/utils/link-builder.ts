import type { OrgRepoSummary, IssueSortOrder } from './types'

/**
 * Builds a GitHub search URL for the given repository list with smart organization optimization and sorting.
 * Repositories must be fully qualified (e.g., "owner/repo").
 *
 * @param selectedRepos Array of fully qualified repository names selected by the user
 * @param orgs Array of active organization summaries for query optimization
 * @param sort The sort order for the issues on GitHub
 * @returns Complete encoded GitHub search URL
 */
export function buildGithubSearchUrl(
  selectedRepos: string[],
  orgs: OrgRepoSummary[] = [],
  sort: IssueSortOrder = 'created-desc'
): string {
  if (!selectedRepos || selectedRepos.length === 0) {
    return 'https://github.com/search'
  }

  const queryParts: string[] = []
  const processedRepos = new Set<string>()

  // Optimization logic for each organization
  for (const org of orgs) {
    const selectedInOrg = selectedRepos.filter(repo =>
      org.allRepos.some(r => r.toLowerCase() === repo.toLowerCase())
    )

    if (selectedInOrg.length === 0) {
      continue
    }

    // Mark these repos as processed so they don't fall back to standard inclusion
    for (const repo of selectedInOrg) {
      processedRepos.add(repo.toLowerCase())
    }

    const unselectedInOrg = org.allRepos.filter(repo =>
      !selectedRepos.some(r => r.toLowerCase() === repo.toLowerCase())
    )

    if (selectedInOrg.length > org.allRepos.length / 2) {
      // Exclusion syntax: org:orgName -repo:unselected-repo1 -repo:unselected-repo2
      queryParts.push(`org:${org.name}`)
      for (const repo of unselectedInOrg) {
        queryParts.push(`-repo:${repo}`)
      }
    } else {
      // Inclusion syntax: repo:selected-repo1 repo:selected-repo2
      for (const repo of selectedInOrg) {
        queryParts.push(`repo:${repo}`)
      }
    }
  }

  // Fallback for selected repositories not belonging to any active organization
  for (const repo of selectedRepos) {
    if (!processedRepos.has(repo.toLowerCase())) {
      queryParts.push(`repo:${repo}`)
    }
  }

  // Push standard filters
  queryParts.push('is:issue', 'is:open')

  // Append sort order
  queryParts.push(`sort:${sort}`)

  const query = queryParts.join(' ')

  return `https://github.com/search?q=${encodeURIComponent(query)}`
}
