<template>
  <div class="md:flex md:flex-wrap md:justify-center">
    <div class="w-full mb-2">
      <p>{{ description }}</p>
    </div>

    <div
      v-if="trophiesUseRateChart != undefined"
      class="card-wrapper"
    >
      <plotly
        :traces="trophiesUseRateChart.traces"
        :layout="trophiesUseRateChart.layout"
        :options="trophiesUseRateChart.options"
        class="h-48 card card--dark md:max-w-lg"
      ></plotly>
    </div>

    <div
      v-if="trophiesWinRateChart != undefined"
      class="card-wrapper"
    >
      <plotly
        :traces="trophiesWinRateChart.traces"
        :layout="trophiesWinRateChart.layout"
        :options="trophiesWinRateChart.options"
        class="h-48 card card--dark md:max-w-lg"
      ></plotly>
    </div>

    <div
      v-if="trophiesStarRateChart != undefined"
      class="card-wrapper"
    >
      <plotly
        :traces="trophiesStarRateChart.traces"
        :layout="trophiesStarRateChart.layout"
        :options="trophiesStarRateChart.options"
        class="h-48 card card--dark md:max-w-lg"
      ></plotly>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { scaleInto } from '~/lib/util'
import { BrawlerStatisticsRows } from '~/model/Clicker'

interface Row {
  brawler_trophyrange: number
  picks: number
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

const trophyGraphLayout = {
  xaxis: {
    title: 'Trophies',
    fixedrange: true,
    tickcolor: '#ffffff',
  },
  yaxis: {
    title: '',
    fixedrange: true,
    tickformat: ',.0%',
    tickcolor: '#ffffff',
  },
  margin: { t: 10, l: 55, b: 65, r: 10 },
  showlegend: true,
  legend: {
    x: 0,
    y: 1,
    bgcolor: 'rgba(0, 0, 0, 0.5)',
    font: {
      size: 10,
    },
  },
}

const trophyranges = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default Vue.extend({
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: [] as Row[],
      totals: [] as Row[],
    }
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const brawlerData = await this.$clicker.query<Row>('meta.brawler.by-trophies-widget', 'map',
      ['brawler_trophyrange'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlices('map'),
        // TODO use ID
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = brawlerData.data

    const totalData = await this.$clicker.query<Row>('meta.brawler.by-trophies-widget', 'map',
      ['brawler_trophyrange'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlices('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.totals = totalData.data
  },
  computed: {
    useRates(): number[] {
      if (this.data.length == 0 || this.totals.length == 0) {
        return []
      }
      return trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.picks_weighted
        / this.totals.find(b => b.brawler_trophyrange == t)!.picks_weighted
      )
    },
    description(): string {
      if (this.useRates.length == 0) {
        return ''
      }

      const sum = (ns: number[]) => ns.reduce((sum, n) => sum + n, 0)
      const lowerSum = sum(this.useRates.slice(0, 4))
      const upperSum = sum(this.useRates.slice(6, 10))
      const slope = (upperSum - lowerSum) / (lowerSum + upperSum)
      const slopeWords = ['less popular than', 'about as popular as', 'more popular than']
      const slopeWord = slopeWords[scaleInto(-0.25, 0.25, slopeWords.length - 1, slope)]
      return `
        In high trophy battles, ${this.brawlerName} is ${slopeWord} than in low trophy battles.
      `
    },
    trophiesStarRateChart(): any {
      if (this.data.length == 0 || this.totals.length == 0) {
        return undefined
      }

      const starRates = trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.battle_starplayer)
      const avgStarRates = trophyranges.map(t =>
        this.totals.find(b => b.brawler_trophyrange == t)!.battle_starplayer)

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: starRates,
          mode: 'lines+markers',
          type: 'scatter',
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: avgStarRates,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: 'Star Rate',
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
          },
        },
      }
    },
    trophiesUseRateChart(): any {
      if (this.data.length == 0 || this.totals.length == 0) {
        return undefined
      }

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: this.useRates,
          mode: 'lines+markers',
          type: 'scatter',
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: trophyranges.map(t => 1 / this.totalBrawlers),
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: 'Use Rate',
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
          },
        },
      }
    },
    trophiesWinRateChart(): any {
      if (this.data.length == 0 || this.totals.length == 0) {
        return undefined
      }

      const winRates = trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.battle_victory)
      const avgWinRates = trophyranges.map(t =>
        this.totals.find(b => b.brawler_trophyrange == t)!.battle_victory)

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: winRates,
          mode: 'lines+markers',
          type: 'scatter',
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: avgWinRates,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: 'Win Rate',
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
          },
        },
      }
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  }
})
</script>
