<template>
  <div class="page container">
    <div class="flex flex-wrap justify-around">
      <label class="mt-2 ml-2">
        Select Cube:
        <select
          v-model="selectedCube"
          class="select"
        >
          <option
            v-for="cube in availableCubes"
            :key="cube"
            :value="cube"
          >
            {{ cube }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Select Metric:
        <select
          v-model="selectedMetric"
          class="select"
        >
          <option
            v-for="metric in availableMetrics"
            :key="metric"
            :value="metric"
          >
            {{ metric }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Sort by Metric:
        <select
          v-model="selectedSort"
          class="select"
        >
          <option
            v-for="metric in availableMetrics"
            :key="metric"
            :value="metric"
          >
            {{ metric }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Select Dimension:
        <select
          v-model="selectedDimension"
          class="select"
        >
          <option
            v-for="dimension in availableDimensions"
            :key="dimension"
            :value="dimension"
          >
            {{ dimension }}
          </option>
        </select>
      </label>
    </div>

    <p
      v-if="error != ''"
      class="mt-6 text-red-500 text-center"
    >
      {{ error }}
    </p>

    <div class="mt-6 flex flex-wrap justify-center">
      <div class="w-full card card--dark">
        <plotly
          :options="graphOptions"
          :layout="graphLayout"
          :traces="graphTraces"
        ></plotly>
      </div>

      <div class="mt-4 mx-auto card card--dark card__content">
        <table>
          <thead>
            <tr>
              <th>{{ selectedDimension }}</th>
              <th>{{ selectedMetric }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in data"
              :key="index"
            >
              <td>{{ row[selectedDimension] }}</td>
              <td>{{ row[selectedMetric] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import query, { cubes, metrics, dimensions } from '../lib/query'

export default Vue.extend({
  data() {
    return {
      data: [] as any[],
      totals: {} as any,
      error: '',
      availableCubes: cubes,
      selectedCube: 'map',
      availableMetrics: metrics,
      selectedMetric: 'battle_victory',
      selectedSort: 'battle_victory',
      availableDimensions: dimensions,
      selectedDimension: 'brawler_name',
    }
  },
  watch: {
    selectedCube: 'query',
    selectedMetric: 'query',
    selectedSort: 'query',
    selectedDimension: 'query',
  },
  created() {
    this.query()
  },
  methods: {
    async query() {
      try {
        this.error = ''
        const response = await query({
          $axios: this.$axios,
          env: { clickerUrl: process.env.clickerUrl } },
          [this.selectedCube],
          [this.selectedDimension],
          [this.selectedMetric],
          {},
          {
            sort: {
              [this.selectedSort]: 'desc',
            },
          })
        this.data = response.data
        this.totals = response.totals
      } catch (err) {
        console.log(err)
        this.error = 'Invalid Parameters'
      }
    },
  },
  computed: {
    graphLayout(): object {
      return {
        xaxis: {
          title: this.selectedDimension,
          tickcolor: '#ffffff',
        },
        yaxis: {
          title: this.selectedMetric,
          tickcolor: '#ffffff',
        },
        margin: { t: 10, l: 55, b: 65, r: 10 },
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: {
          color: '#ffffff',
        },
      }
    },
    graphOptions(): object {
      return {
        responsive: true,
      }
    },
    graphTraces(): object {
      return [{
        x: this.data.map((row) => row[this.selectedDimension]),
        y: this.data.map((row) => row[this.selectedMetric]),
        type: 'bar',
      }]
    },
  },
})
</script>

<style lang="postcss" scoped>
.select {
  @apply bg-primary hover:bg-primary-light rounded py-1 px-2 ml-2;
}
</style>