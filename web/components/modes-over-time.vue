<template>
  <plotly
    :traces="chart.traces"
    :layout="chart.layout"
    :options="chart.options"
    class="h-80 card card--dark"
  ></plotly>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatMode } from '~/lib/util'

interface Row {
  battle_event_mode: string
  trophy_season_end: string
  picks: number
}

export default Vue.extend({
  data() {
    return {
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('stats.popularity.mode-history', 'map',
      ['battle_event_mode', 'trophy_season_end'],
      ['picks', 'trophy_season_end'], {
        ...this.$clicker.defaultSlices('map'),
        trophy_season_end: ['2020-06-15 08:00:00'],
      }, {
        sort: { picks: 'desc' },
        cache: 60*60,
      })
    this.data = data.data as any
  },
  computed: {
    chart(): any {
      const seasonTotalMap = new Map<string, number>()
      const modeSeasonMap = new Map<string, Map<string, number>>()

      this.data.forEach((e) => {
        // with every battle, allies are added to map meta as well,
        // so manually correct the totals
        const picks =
          e.battle_event_mode == 'soloShowdown' ? e.picks
          : e.battle_event_mode == 'duoShowdown' ? e.picks / 2
          : e.picks / 3

        let total = 0
        if (seasonTotalMap.has(e.trophy_season_end)) {
          total = seasonTotalMap.get(e.trophy_season_end)!
        }
        seasonTotalMap.set(e.trophy_season_end, total + picks)

        if (!modeSeasonMap.has(e.battle_event_mode)) {
          modeSeasonMap.set(e.battle_event_mode, new Map<string, number>())
        }
        const seasonMap = modeSeasonMap.get(e.battle_event_mode)!
        let current = 0
        if (seasonMap.has(e.trophy_season_end)) {
          current = seasonMap.get(e.trophy_season_end)!
        }
        seasonMap.set(e.trophy_season_end, current + picks)
      })

      const modes = [...modeSeasonMap.keys()]

      return {
        traces: modes.map(mode => {
          const seasons = [...modeSeasonMap.get(mode)!.keys()]
          return {
            name: formatMode(mode),
            x: seasons,
            y: seasons.map(s => modeSeasonMap.get(mode)!.get(s)! / seasonTotalMap.get(s)!) ,
            mode: 'lines+markers',
            stackgroup: 'totals',
          }
        }),
        layout: {
          xaxis: {
            title: 'Trophy Season',
            fixedrange: true,
            tickcolor: '#ffffff',
          },
          yaxis: {
            title: '',
            tickformat: ',.0%',
            tickcolor: '#ffffff',
          },
          margin: { t: 10, l: 55, b: 80, r: 10 },
          showlegend: true,
        },
      }
    },
  },
})
</script>
