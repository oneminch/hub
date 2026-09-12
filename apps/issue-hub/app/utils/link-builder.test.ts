import { describe, it, expect } from 'vitest'
import { buildGithubSearchUrl } from './link-builder'
import type { OrgRepoSummary } from './types'

describe('buildGithubSearchUrl', () => {
  it('should return default search page when no repos are provided', () => {
    expect(buildGithubSearchUrl([])).toBe('https://github.com/search')
  })

  it('should construct a single-repo search URL correctly with default sort', () => {
    const repos = ['nuxt/ui']
    const expectedQuery = encodeURIComponent('repo:nuxt/ui is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(repos)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should construct a multi-repo search URL correctly with default sort', () => {
    const repos = ['nuxt/ui', 'nuxt/nuxt', 'vuejs/core']
    const expectedQuery = encodeURIComponent('repo:nuxt/ui repo:nuxt/nuxt repo:vuejs/core is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(repos)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should append correct sort:created-asc parameter when specified', () => {
    const repos = ['nuxt/ui']
    const expectedQuery = encodeURIComponent('repo:nuxt/ui is:issue is:open sort:created-asc')
    expect(buildGithubSearchUrl(repos, [], 'created-asc')).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should use inclusion syntax when <= 50% of repositories are selected in an org', () => {
    const selected = ['nuxt/ui']
    const orgs: OrgRepoSummary[] = [
      {
        name: 'nuxt',
        allRepos: ['nuxt/ui', 'nuxt/nuxt', 'nuxt/image', 'nuxt/fonts']
      }
    ]
    // 1 out of 4 selected (25% <= 50%)
    const expectedQuery = encodeURIComponent('repo:nuxt/ui is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(selected, orgs)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should use exclusion syntax when > 50% of repositories are selected in an org', () => {
    const selected = ['nuxt/ui', 'nuxt/nuxt', 'nuxt/image']
    const orgs: OrgRepoSummary[] = [
      {
        name: 'nuxt',
        allRepos: ['nuxt/ui', 'nuxt/nuxt', 'nuxt/image', 'nuxt/fonts']
      }
    ]
    // 3 out of 4 selected (75% > 50%) -> org:nuxt -repo:nuxt/fonts
    const expectedQuery = encodeURIComponent('org:nuxt -repo:nuxt/fonts is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(selected, orgs)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should mix inclusion and exclusion across different organizations', () => {
    const selected = [
      'nuxt/ui', 'nuxt/nuxt', 'nuxt/image', // 3 of 4 in nuxt (75% -> exclusion)
      'vuejs/core'                          // 1 of 3 in vuejs (33.3% -> inclusion)
    ]
    const orgs: OrgRepoSummary[] = [
      {
        name: 'nuxt',
        allRepos: ['nuxt/ui', 'nuxt/nuxt', 'nuxt/image', 'nuxt/fonts']
      },
      {
        name: 'vuejs',
        allRepos: ['vuejs/core', 'vuejs/router', 'vuejs/pinia']
      }
    ]
    const expectedQuery = encodeURIComponent('org:nuxt -repo:nuxt/fonts repo:vuejs/core is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(selected, orgs)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })

  it('should fallback to inclusion for orphan selected repos (not in any active orgs list)', () => {
    const selected = ['nuxt/ui', 'vuejs/core']
    const orgs: OrgRepoSummary[] = [
      {
        name: 'nuxt',
        allRepos: ['nuxt/ui', 'nuxt/nuxt'] // 1 of 2 (50% <= 50% -> inclusion)
      }
      // vuejs is not in orgs
    ]
    const expectedQuery = encodeURIComponent('repo:nuxt/ui repo:vuejs/core is:issue is:open sort:created-desc')
    expect(buildGithubSearchUrl(selected, orgs)).toBe(`https://github.com/search?q=${expectedQuery}`)
  })
})
