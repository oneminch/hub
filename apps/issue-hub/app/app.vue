<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Issue Hub'
const description = 'Aggregate open-source GitHub issues from multiple organizations and repositories in seconds.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UContainer class="relative">
      <div class="absolute top-8 right-4 z-50">
        <UColorModeButton />
      </div>

      <UMain>
        <NuxtPage />
      </UMain>
    </UContainer>
  </UApp>
</template>
