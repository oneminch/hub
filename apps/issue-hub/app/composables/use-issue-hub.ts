import { ref, computed } from 'vue'
import type { AppRepository, OrgState, UnghRepository } from '../utils/types'

export function useIssueHub() {
  // Set of selected repository fullNames (e.g., "nuxt/nuxt")
  const selectedRepos = ref<Set<string>>(new Set())

  // Map of organization name to its loading/pagination state
  const orgStates = ref<Map<string, OrgState>>(new Map())

  // Flattened list of all loaded repositories
  const allRepos = computed<AppRepository[]>(() => {
    const list: AppRepository[] = []
    for (const org of orgStates.value.values()) {
      list.push(...org.repos)
    }
    return list
  })

  // Grouped repositories computed by organization name
  const reposByOrg = computed(() => {
    const grouped = new Map<string, AppRepository[]>()
    for (const org of orgStates.value.keys()) {
      const orgState = orgStates.value.get(org)
      if (orgState) {
        grouped.set(org, orgState.repos)
      }
    }
    return grouped
  })

  const addOrganization = async (orgName: string) => {
    const normalized = orgName.trim().toLowerCase()
    if (!normalized) return

    if (orgStates.value.has(normalized)) return

    // Initialize state
    orgStates.value.set(normalized, {
      name: normalized,
      repos: [],
      allRepoNames: [],
      currentPage: 1,
      hasMore: false,
      status: 'idle',
      error: null
    })

    await fetchReposForOrg(normalized, true)
  }

  const removeOrganization = (orgName: string) => {
    const normalized = orgName.trim().toLowerCase()
    orgStates.value.delete(normalized)

    // Clean up selections belonging to this org
    for (const fullName of selectedRepos.value) {
      if (fullName.toLowerCase().startsWith(`${normalized}/`)) {
        selectedRepos.value.delete(fullName)
      }
    }
  }

  const fetchReposForOrg = async (orgName: string, isFirstLoad = false) => {
    const state = orgStates.value.get(orgName)
    if (!state) return

    if (state.status === 'pending') return

    state.status = 'pending'
    state.error = null

    try {
      // ungh.cc fetches all repositories at once, so we mock pagination on the client side to keep things simple
      const response = await $fetch<{ repos: UnghRepository[] }>(`https://ungh.cc/orgs/${orgName}/repos`)

      if (!response || !Array.isArray(response.repos)) {
        throw new Error('Invalid response from ungh.cc API')
      }

      // Filter non-archived and sort by star count descending
      const filteredSorted = response.repos
        .filter(r => !r.archived)
        .map(r => ({
          ...r,
          orgName,
          fullName: r.repo || `${orgName}/${r.name}`
        }))
        .sort((a, b) => b.stars - a.stars)

      const limit = 10
      const targetPage = isFirstLoad ? 1 : state.currentPage + 1
      const paginatedRepos = filteredSorted.slice(0, targetPage * limit)

      state.repos = paginatedRepos
      state.allRepoNames = filteredSorted.map(r => r.fullName)
      state.currentPage = targetPage
      state.hasMore = filteredSorted.length > targetPage * limit
      state.status = 'success'
    } catch (e) {
      state.status = 'error'
      state.error = (e instanceof Error ? e.message : String(e)) || 'Failed to fetch repositories'
    }
  }

  const loadMore = async (orgName: string) => {
    await fetchReposForOrg(orgName, false)
  }

  const toggleRepoSelection = (fullName: string) => {
    if (selectedRepos.value.has(fullName)) {
      selectedRepos.value.delete(fullName)
    } else {
      selectedRepos.value.add(fullName)
    }
  }

  const clearSelection = () => {
    selectedRepos.value.clear()
  }

  return {
    selectedRepos,
    orgStates,
    allRepos,
    reposByOrg,
    addOrganization,
    removeOrganization,
    loadMore,
    toggleRepoSelection,
    clearSelection
  }
}
