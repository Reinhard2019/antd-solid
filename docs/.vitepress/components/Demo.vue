<template>
  <div ref="app" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
// @ts-ignore
import { ConfigProvider } from 'antd-solid'
// @ts-ignore
import antdCss from 'antd-solid-css/index.css?raw'
// @ts-ignore
import antdRaw from 'antd-solid-dist/index.umd.js?raw'
import { nanoid } from 'nanoid'

interface Props {
  path?: string
}
const props = defineProps<Props>()

const route = useRoute()

let path = props.path
if (!path) {
  const params = new URLSearchParams(window.location.search)
  path = params.get('path')
}

let app = ref<HTMLDivElement>()

// @ts-ignore
const codeModules = import.meta.glob('../../demos/*/**.tsx', { as: 'raw' })

const { isDark, localeIndex } = useData()

onMounted(() => {
  codeModules[`../../demos/${path}.tsx`]().then(value => {
    // 以下的代码在生产环境下会被注释掉
    // Non-production code start
    // @ts-ignore
    if (import.meta.env.MODE !== 'production') {
      // @ts-ignore
      const modules = import.meta.glob('../../demos/*/**.tsx')
      modules[`../../demos/${path}.tsx`]().then(module => {
        const App = module.default
        import('solid-js/web').then(({ render, createComponent }) => {
          render(() => createComponent(ConfigProvider, {
            theme: isDark.value ? 'dark' : 'light',
            get children() {
              return createComponent(App, {})
            }
          }), app.value!)
        })
      })
      return
    }
    // Non-production code end

    // @ts-ignore
    if (!window.babelLoadPromise) {
      // @ts-ignore
      window.babelLoadPromise = new Promise(resolve => {
        const style = document.createElement('style')
        style.innerHTML = antdCss
        document.head.append(style)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/@babel/standalone@7.21.2/babel.min.js'
        document.head.append(script)
        script.onload = () => {
          const script = document.createElement('script')
          script.type = 'module'
          // @ts-ignore
          window.__resolve__ = resolve
          script.innerHTML = `
        import babelPresetSolid from 'https://cdn.jsdelivr.net/npm/babel-preset-solid@1.8.4/+esm';
        import * as SolidJs from "https://jspm.dev/solid-js";
        import * as SolidJsWeb from "https://jspm.dev/solid-js/web";
        import * as Nanoid from "https://cdn.jsdelivr.net/npm/nanoid@5.0.2/+esm";
        import Classnames from "https://cdn.jsdelivr.net/npm/classnames@2.3.2/+esm";
        import Lodash from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm";
        import * as Yup from "https://cdn.jsdelivr.net/npm/yup@1.3.2/+esm";

        Babel.registerPreset("solid", babelPresetSolid());

        window.SolidJs = SolidJs;
        window.SolidJsWeb = SolidJsWeb;
        window.Nanoid = Nanoid;
        window.Classnames = Classnames;
        window.Lodash = Lodash;
        window.Yup = Yup;

        ${antdRaw}

        // babel 转化后的代码依赖于 require
        function require(name) {
          const libMap = {
            'solid-js': SolidJs,
            'solid-js/web': SolidJsWeb,
            'antd-solid': AntdSolid,
            yup: Yup,
            lodash: Lodash,
            nanoid: Nanoid,
            classnames: Classnames,
          }
          return libMap[name]
        }
        window.require = require;

        window.__resolve__();
        delete window.__resolve__;
      `
          document.head.append(script)
        }
      })
    }

    // @ts-ignore
    window.babelLoadPromise.then(() => {
      const appRef = nanoid()
      // @ts-ignore
      window[appRef] = app.value

      let _code = `
      import { ConfigProvider } from 'antd-solid'
    ${code.value}
    const Component = exports["default"];
    window.SolidJsWeb.render(() => (
      <ConfigProvider theme="${isDark.value ? 'dark' : 'light'}">
        <Component />
      </ConfigProvider>
    ), window['${appRef}']);
  `

      // @ts-ignore
      _code = window.Babel.transform(_code, {
        presets: [
          ['typescript', { isTSX: true, allExtensions: true }],
          'env',
          'solid'
        ],
        filename: 'app.ts',
      }).code;

      // @ts-ignore
      window.exports = {}
      eval(_code)
    })
  })
})
</script>