<template>
  <div class="page container flex justify-center">
    <div class="w-full max-w-md card card--dark card__content">
      <h1 class="page-h1">{{ club.name }}</h1>

      <blockquote class="mt-2 italic">
        {{ club.description }}
      </blockquote>

      <table class="mt-2 w-full">
        <thead>
          <tr class="h-8 border-b border-gray-600 text-left">
            <th scope="col">
              Name
            </th>
            <th scope="col">
              Role
            </th>
            <th scope="col">
              Trophies
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in club.members"
            :key="member.tag"
            class="pt-1"
          >
            <router-link
              :to="`/player/${member.tag}`"
              :title="member.name"
              tag="th"
              scope="row"
              class="pr-2 text-left"
            >
              <media-img
                :path="`/avatars/${member.icon.id}`"
                clazz="h-8 mr-1 inline"
              ></media-img>
              <span>{{ member.name }}</span>
            </router-link>
            <td>
              {{ capitalize(member.role).replace('VicePresident', 'Vice President') }}
            </td>
            <td class="text-center">
              {{ member.trophies }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { capitalize } from '../../lib/util'
import { Club } from '../../model/Brawlstars'

export default Vue.extend({
  head(): MetaInfo {
    // TODO
    const description = `${this.club.name} Brawl Stars Club. ${this.club.description}`
    return {
      title: this.club.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      club: {} as Club,
    }
  },
  computed: {
    capitalize() {
      return capitalize
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    })
  },
  async asyncData({ $axios, params }) {
    const club = await $axios.$get<Club>(`/api/club/${params.tag}`)

    return {
      club,
    }
  },
  methods: {
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$ga.event('club', 'scroll', section)
      }
    },
  },
})
</script>
