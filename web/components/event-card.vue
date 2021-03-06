<template>
  <card
    :title="mode != undefined ? formatMode(mode) : undefined"
    :title-link="mode != undefined ? `/tier-list/mode/${camelToKebab(mode)}` : undefined"
    :subtitle="mapName"
    :subtitle-link="map != undefined ? `/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}` : undefined"
    :background="background"
    :icon="mode != undefined ? '/modes/' + mode + '/icon' : undefined"
    :size="size"
    :color="mode != undefined ? 'color-' + mode.toLowerCase() : undefined"
  >
    <media-img
      slot="preview"
      v-if="id != undefined && id != 0"
      :path="`/maps/${id}`"
      size="80"
      clazz="h-12"
    ></media-img>
    <img
      slot="preview"
      v-if="staticImageUrl != undefined"
      :src="staticImageUrl"
      style="max-height: 3rem"
    >

    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
  </card>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue from 'vue'
import { camelToKebab, formatMode, slugify } from '../lib/util'

export default Vue.extend({
  props: {
    mode: {
      // camel case
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      // enables map icon top right
      type: [String, Number],
    },
    size: {
      // class
      type: String,
      default: 'w-80',
    },
    nobackground: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      staticImageUrl: undefined as undefined|string,
      mapOverride: undefined as undefined|string,
    }
  },
  // TODO find a better solution to this hack
  // move it into media or at least move it to the parent
  fetchDelay: 0,
  async fetch() {
    if (this.map?.startsWith('Competition Winner ')) {
      const id = this.map.replace('Competition Winner ', '')
      const content = await this.$content(`/maps/${id}`).fetch().catch(err => ({})) as IContentDocument
      this.mapOverride = content.map
      this.staticImageUrl = `/images/maps/${id}.png`
    }
  },
  computed: {
    mapName(): string|undefined {
      return this.mapOverride || this.map
    },
    formatMode() {
      return formatMode
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    background(): string|undefined {
      if (this.nobackground) {
        return undefined
      }
      const path = '/modes/' + this.mode + '/background'
      const query = '?size=800'
      const url = process.env.mediaUrl + path + (this.$supportsWebp ? '.webp' : '.jpg') + query
      return url
    },
  },
})
</script>
