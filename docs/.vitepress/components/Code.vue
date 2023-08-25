<template>
  <div class="ant-[border:1px_solid_rgba(5,5,5,0.06)] ant-rounded-6px">
    <div class="ant-px-24px ant-py-36px">
      <div ref="demoContainer"></div>
    </div>
    <!-- <div class="ant-[border-top:1px_solid_rgba(5,5,5,0.06)] ant-relative ant-px-24px ant-pt-18px ant-pb-12px">
      <div class="ant-font-bold ant-absolute -ant-translate-y-1/2 ant-left-16px ant-top-0 ant-bg-white ant-px-8px">{{
        title }}</div>
      <div>{{ description }}</div>
    </div> -->
    <div
      class="ant-[border-top:1px_dashed_rgba(5,5,5,0.06)] ant-flex ant-justify-center ant-items-center ant-py-12px ant-gap-16px ant-h-40px">
      <span class="i-ant-design:copy ant-cursor-pointer" @click="() => onCopy(code)" />
      <img v-show="!expand" class="ant-w-16px ant-cursor-pointer"
        src="https://gw.alipayobjects.com/zos/antfincdn/Z5c7kzvi30/expand.svg" alt="expand" @click="expand = !expand" />
      <img v-show="expand" class="ant-w-16px ant-cursor-pointer"
        src="https://gw.alipayobjects.com/zos/antfincdn/4zAaozCvUH/unexpand.svg" alt="unexpand"
        @click="expand = !expand" />
    </div>
    <div v-show="expand" class="ant-[border-top:1px_dashed_rgba(5,5,5,0.06)]">
      <pre class='language-typescript !ant-m-0 !ant-bg-white !ant-p-16px !ant-flex'>
        <code class="!ant-text-[var(--dark-color)] !ant-p-0" v-html="codeHtml"></code>
      </pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Component } from 'solid-js'
import { render, createComponent } from 'solid-js/web'
import { onMounted, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-typescript'

interface Props {
  component: Component
  code: string
  // title?: string
  // description?: string
}
const props = defineProps<Props>()

let demoContainer = ref<HTMLDivElement>()

let expand = ref(false)

let codeHtml = ref('')

onMounted(() => {
  render(() => createComponent(props.component, {}), demoContainer.value!)

  codeHtml.value = Prism.highlight(props.code, Prism.languages.typescript, 'typescript')
})

function onCopy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>