<script setup lang="ts">
import { ref, computed } from "vue";
import { buildGithubSearchUrl } from "~/utils/link-builder";
import type { IssueSortOrder, OrgRepoSummary } from "~/utils/types";

// Load our state-managing composable
const {
  selectedRepos,
  orgStates,
  addOrganization,
  removeOrganization,
  loadMore,
  toggleRepoSelection,
  clearSelection,
} = useIssueHub();

// Input for typing a new GitHub organization
const newOrgInput = ref("");
const isAdding = ref(false);

// Clipboard toast reference
const toast = useToast();

const handleAddOrg = async () => {
  const org = newOrgInput.value.trim();
  if (!org) return;

  isAdding.value = true;
  try {
    await addOrganization(org);
    newOrgInput.value = "";
  } finally {
    isAdding.value = false;
  }
};

// Sort order state and options
const sortOrder = ref<IssueSortOrder>("created-desc");
const sortOptions = [
  { label: "Newest First", value: "created-desc" },
  { label: "Oldest First", value: "created-asc" },
];

// Convert orgStates Map into an array of OrgRepoSummary for link-builder
const orgSummaries = computed<OrgRepoSummary[]>(() => {
  const summaries: OrgRepoSummary[] = [];
  for (const [name, state] of orgStates.value.entries()) {
    summaries.push({
      name,
      allRepos: state.allRepoNames,
    });
  }
  return summaries;
});

// Generate complete search aggregation link and copy it
const generatedUrl = computed(() => {
  return buildGithubSearchUrl(
    Array.from(selectedRepos.value),
    orgSummaries.value,
    sortOrder.value,
  );
});

const handleCopyLink = async () => {
  if (selectedRepos.value.size === 0) return;

  try {
    await navigator.clipboard.writeText(generatedUrl.value);
    toast.add({
      title: "Copied to clipboard!",
      description:
        "The GitHub issue aggregation link has been copied successfully.",
      color: "success",
    });
  } catch {
    toast.add({
      title: "Failed to copy",
      description: "An error occurred while copying the link to clipboard.",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Hero / Header Section -->
    <div class="text-center mb-8">
      <h1
        class="text-4xl font-extrabold tracking-tight sm:text-5xl text-primary mb-3"
      >
        Issue Hub
      </h1>
      <p
        class="text-lg text-neutral-500 max-w-xl mx-auto dark:text-neutral-400"
      >
        Aggregate public GitHub repository issues from multiple organizations
        into a single search link.
      </p>
    </div>

    <!-- Org Input Controls -->
    <UCard class="mb-8">
      <template #header>
        <h3
          class="text-base font-semibold leading-6 text-neutral-900 dark:text-white"
        >
          Add Organizations
        </h3>
      </template>

      <form class="flex gap-3" @submit.prevent="handleAddOrg">
        <UInput
          v-model="newOrgInput"
          placeholder="e.g. nuxt, vuejs, tailwindlabs"
          icon="i-lucide-search"
          size="md"
          class="flex-1"
          :disabled="isAdding"
        />
        <UButton
          type="submit"
          label="Add"
          color="primary"
          icon="i-lucide-plus"
          size="md"
          :loading="isAdding"
        />
      </form>
    </UCard>

    <!-- Empty State -->
    <div
      v-if="orgStates.size === 0"
      class="text-center py-12 px-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg animate-fade-in"
    >
      <UIcon
        name="i-lucide-layers"
        class="w-12 h-12 text-neutral-400 mx-auto mb-4"
      />
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
        No Organizations Added
      </h3>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Get started by entering a GitHub organization above.
      </p>
    </div>

    <!-- Grouped Repository Sections -->
    <div v-else class="space-y-6">
      <UCard
        v-for="[orgName, state] in orgStates.entries()"
        :key="orgName"
        class="overflow-hidden"
        :ui="{ body: 'p-0!' }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-folder-git-2"
                class="w-5 h-5 text-primary"
              />
              <h2
                class="text-lg font-bold capitalize text-neutral-900 dark:text-white"
              >
                {{ orgName }}
              </h2>
              <UBadge
                v-if="state.repos.length > 0"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ state.repos.length }} repos loaded
              </UBadge>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Remove organization"
              @click="removeOrganization(orgName)"
            />
          </div>
        </template>

        <!-- Loading State for this Org -->
        <div
          v-if="state.status === 'pending' && state.repos.length === 0"
          class="flex justify-center p-4 sm:p-6"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary"
          />
        </div>

        <!-- Error State for this Org -->
        <div v-else-if="state.status === 'error'" class="p-4 sm:p-6">
          <UAlert
            icon="i-lucide-triangle-alert"
            color="error"
            variant="subtle"
            title="Failed to load repositories"
            :description="
              state.error ||
              'Please double-check organization name and connection.'
            "
          />
        </div>

        <!-- Repositories Checkbox List -->
        <div
          v-else-if="state.repos.length === 0"
          class="text-center p-4 sm:p-6 text-neutral-500 text-sm"
        >
          No public, non-archived repositories found for this organization.
        </div>

        <div v-else class="space-y-4">
          <!-- <div class="p-4 sm:p-6"> -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 sm:p-6"
          >
            <label
              v-for="repo in state.repos"
              :key="repo.id"
              class="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
            >
              <UCheckbox
                :model-value="selectedRepos.has(repo.fullName)"
                class="mt-1"
                @update:model-value="toggleRepoSelection(repo.fullName)"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 justify-between">
                  <span
                    class="font-medium text-neutral-900 dark:text-white truncate"
                  >
                    {{ repo.name }}
                  </span>
                  <div
                    class="flex items-center gap-1 shrink-0 text-neutral-500 text-xs"
                  >
                    <UIcon
                      name="i-lucide-star"
                      class="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                    />
                    <span>{{ repo.stars.toLocaleString() }}</span>
                  </div>
                </div>
                <p
                  v-if="repo.description"
                  class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1"
                >
                  {{ repo.description }}
                </p>
              </div>
            </label>
            <!-- </div> -->
          </div>
        </div>

        <template #footer>
          <!-- Pagination Button -->
          <div v-if="state.hasMore" class="flex justify-center">
            <UButton
              label="Load More"
              variant="subtle"
              color="neutral"
              size="md"
              icon="i-lucide-chevron-down"
              :loading="state.status === 'pending'"
              @click="loadMore(orgName)"
            />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Sticky Floating Action Bar for Generating Link -->
    <div
      v-if="selectedRepos.size > 0"
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50"
    >
      <div
        class="bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-neutral-200 dark:border-neutral-800 ring-4 ring-accented/50"
      >
        <div class="min-w-0">
          <div class="text-sm font-semibold">
            {{ selectedRepos.size }}
            {{ selectedRepos.size === 1 ? "repository" : "repositories" }}
            selected
          </div>
          <p class="text-xs text-neutral-400 truncate mt-0.5">
            {{ Array.from(selectedRepos).join(", ") }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <USelect
            v-model="sortOrder"
            :items="sortOptions"
            variant="subtle"
            color="neutral"
            size="sm"
            class="w-32"
          />
          <UButton
            label="Generate & Copy Link"
            color="primary"
            size="sm"
            icon="i-lucide-clipboard"
            @click="handleCopyLink"
          />
          <UButton
            aria-label="Open Link"
            variant="outline"
            color="primary"
            size="sm"
            icon="i-lucide-external-link"
            :to="generatedUrl"
          />
          <UButton
            aria-label="Clear"
            variant="outline"
            color="primary"
            size="sm"
            icon="i-lucide-eraser"
            @click="clearSelection"
          />
        </div>
      </div>
    </div>
  </div>
</template>
