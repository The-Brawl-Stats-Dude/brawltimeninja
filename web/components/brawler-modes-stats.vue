<template>
  <div>
    <p>
      {{ description }}
    </p>
    <div class="mt-2 overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
      <lazy
        v-for="(mode, index) in data"
        :key="mode.battle_event_mode"
        :render="showAllModes || index <= 2"
        :class="{
          'md:hidden': !showAllModes && index > 2,
          'mx-4': true,
        }"
        distance="600px"
      >
        <div class="w-80" style="height: 221px" slot="placeholder"></div>
        <brawler-mode-stats
          :mode="mode.battle_event_mode"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
        ></brawler-mode-stats>
      </lazy>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, scaleInto } from '~/lib/util';

interface Row {
  battle_event_mode: string
  battle_victory_adj: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    showAllModes: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query<Row>('all.modes-brawler', 'map',
      ['battle_event_mode'],
      ['battle_event_mode', 'battle_victory_adj'],
      {
        trophy_season_end: ['current'],
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = data.data
  },
  computed: {
    description(): string {
      if (this.data.length == 0) {
        return ''
      }
      const bestModes = this.data.slice().sort((e1, e2) => e2.battle_victory_adj - e1.battle_victory_adj)

      const bestMode = formatMode(bestModes[0].battle_event_mode)
      const viableModes = bestModes.filter(e => e.battle_victory_adj > 0.55).length
      const viableWords = ['no', 'some', 'a few', 'all']
      const viableWord = viableWords[scaleInto(0, 1, viableWords.length - 1, viableModes / bestModes.length)]

      return `
        There are ${viableModes || 'no'} modes where ${this.brawlerName} has a good win rate.
        ${this.brawlerName} shines in ${bestMode}, which is the mode with the highest win rate.
      `
    },
  },
});
</script>
