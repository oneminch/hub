import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIssueHub } from './use-issue-hub'

// Mock $fetch globally for testing
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useIssueHub', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should initialize with empty states', () => {
    const { selectedRepos, orgStates, allRepos } = useIssueHub()
    expect(selectedRepos.value.size).toBe(0)
    expect(orgStates.value.size).toBe(0)
    expect(allRepos.value.length).toBe(0)
  })

  it('should fetch, filter, sort, and paginate repositories correctly', async () => {
    const { addOrganization, orgStates, allRepos } = useIssueHub()

    // Mock API response from ungh.cc
    mockFetch.mockResolvedValueOnce({
      repos: [
        { id: 1, name: 'repo-c', repo: 'test-org/repo-c', description: 'C', stars: 10, archived: false },
        { id: 2, name: 'repo-a', repo: 'test-org/repo-a', description: 'A', stars: 100, archived: false },
        { id: 3, name: 'repo-b', repo: 'test-org/repo-b', description: 'B', stars: 50, archived: true }, // Archived! should be filtered out
        { id: 4, name: 'repo-d', repo: 'test-org/repo-d', description: 'D', stars: 5, archived: false }
      ]
    })

    await addOrganization('test-org')

    expect(mockFetch).toHaveBeenCalledWith('https://ungh.cc/orgs/test-org/repos')
    expect(orgStates.value.has('test-org')).toBe(true)

    const state = orgStates.value.get('test-org')!
    expect(state.status).toBe('success')
    expect(state.error).toBeNull()

    // Archived filtered out, sorted by stars desc: repo-a (100 stars), repo-c (10 stars), repo-d (5 stars)
    expect(state.repos.length).toBe(3)
    expect(state.repos[0]!.fullName).toBe('test-org/repo-a')
    expect(state.repos[1]!.fullName).toBe('test-org/repo-c')
    expect(state.repos[2]!.fullName).toBe('test-org/repo-d')
    expect(state.allRepoNames).toEqual(['test-org/repo-a', 'test-org/repo-c', 'test-org/repo-d'])
    expect(allRepos.value.length).toBe(3)
  })

  it('should handle pagination with loadMore correctly', async () => {
    const { addOrganization, loadMore, orgStates } = useIssueHub()

    // Mock response returning 12 active repos (more than limit of 10)
    const mockRepos = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      repo: `test-org/repo-${i}`,
      description: null,
      stars: i,
      archived: false
    }))

    mockFetch.mockResolvedValue({ repos: mockRepos })

    await addOrganization('test-org')

    const state = orgStates.value.get('test-org')!
    // Page 1 should load top 10 repos (sorted desc by star count, so repo-11 down to repo-2)
    expect(state.currentPage).toBe(1)
    expect(state.repos.length).toBe(10)
    expect(state.hasMore).toBe(true)

    // Trigger loadMore
    await loadMore('test-org')

    // Page 2 should load all 12 repos
    expect(state.currentPage).toBe(2)
    expect(state.repos.length).toBe(12)
    expect(state.hasMore).toBe(false)
  })

  it('should toggle selection correctly and clean up on removal', async () => {
    const { addOrganization, removeOrganization, selectedRepos, toggleRepoSelection } = useIssueHub()

    mockFetch.mockResolvedValueOnce({
      repos: [
        { id: 1, name: 'repo-a', repo: 'test-org/repo-a', description: 'A', stars: 10, archived: false }
      ]
    })

    await addOrganization('test-org')

    toggleRepoSelection('test-org/repo-a')
    expect(selectedRepos.value.has('test-org/repo-a')).toBe(true)

    toggleRepoSelection('test-org/repo-a')
    expect(selectedRepos.value.has('test-org/repo-a')).toBe(false)

    // Select again, then remove org
    toggleRepoSelection('test-org/repo-a')
    expect(selectedRepos.value.has('test-org/repo-a')).toBe(true)

    removeOrganization('test-org')
    expect(selectedRepos.value.has('test-org/repo-a')).toBe(false)
  })
})
