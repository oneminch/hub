export interface UnghRepository {
  id: number
  name: string
  repo: string // e.g. "nuxt/nuxt"
  description: string | null
  stars: number
  archived?: boolean
}

export interface AppRepository extends UnghRepository {
  orgName: string
  fullName: string
}

export interface OrgState {
  name: string
  repos: AppRepository[]
  allRepoNames: string[]
  currentPage: number
  hasMore: boolean
  status: 'idle' | 'pending' | 'success' | 'error'
  error: string | null
}

export type IssueSortOrder = 'created-desc' | 'created-asc'

export interface OrgRepoSummary {
  name: string
  allRepos: string[]
}
