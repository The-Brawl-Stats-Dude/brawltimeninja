import path from 'path'
import PurgecssPlugin from 'purgecss-webpack-plugin'
import glob from 'glob-all'

import payload from './store/payload.json'

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:/]+/g) || []
  }
}

export default {
  mode: 'universal',

  head: {
    title: 'Brawlstars Time Ninja',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Brawlstars Time Ninja - Check time spent on Brawlstars and player statistics' },
      { hid: 'og:description', name: 'og:description', content: 'Brawlstars Time Ninja - Check time spent on Brawlstars and player statistics' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { async: true, src: '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' },
      { innerHTML: `
        (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-6856963757796636",
              enable_page_level_ads: true
        });` }
    ],
    __dangerouslyDisableSanitizers: ['script'],
  },

  loading: { color: '#fff' },

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/app.css',
  ],

  plugins: [
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/analytics', mode: 'client' },
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],

  router: {
  },

  axios: {
  },

  build: {
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      if (!ctx.isDev) {
        config.plugins.push(
          new PurgecssPlugin({
            paths: glob.sync([
              path.join(__dirname, './pages/**/*.vue'),
              path.join(__dirname, './layouts/**/*.vue'),
              path.join(__dirname, './components/**/*.vue'),
              path.join(__dirname, './store/payload.json'),
            ]),
            extractors: [ {
              extractor: TailwindExtractor,
              extensions: ['vue', 'json'],
            } ],
            whitelist: ['html', 'body', 'nuxt-progress'],
          })
        )
      }
    },
    extractCSS: true,
    postcss: {
      plugins: {
        tailwindcss: path.resolve('./tailwind.js')
      },
      preset: { autoprefixer: { grid: true } },
    },
  },

  generate: {
    fallback: true,
    routes() {
      const routes = []

      routes.push({
        route: '/',
      });
      [...Object.entries(payload.blog)].forEach(([topic, posts]) => {
        routes.push({
          route: `/blog/${topic}`,
        })
        posts.forEach(post => routes.push({
          route: `/blog/${topic}/${post.id}`,
        }))
      })

      return routes
    },
  },
}
