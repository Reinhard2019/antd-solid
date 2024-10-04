<template>
  <div class="[border:1px_solid_rgba(5,5,5,0.06)] rounded-6px">
    <div v-if="iframe">
      <div class="h-28px bg-[#EDEDED] flex items-center gap-12px px-6px">
        <div class="shrink-0 h-16px flex items-center gap-8px">
          <span class="inline-block w-12px h-12px rounded-1/2 bg-[#F44]" />
          <span class="inline-block w-12px h-12px rounded-1/2 bg-[#9B3]" />
          <span class="inline-block w-12px h-12px rounded-1/2 bg-[#FB5]" />
        </div>
        <div class="w-full h-16px bg-white rounded-4px" />
      </div>
      <iframe class="border-none w-full" height="300" :src="`/~demos?path=${encodeURIComponent(path)}`" />
    </div>
    <div v-else class="px-24px py-36px">
      <Demo :path="path" />
    </div>
    <!-- <div class="[border-top:1px_solid_rgba(5,5,5,0.06)] relative px-24px pt-18px pb-12px">
      <div class="font-bold absolute -translate-y-1/2 left-16px top-0 bg-white px-8px">{{
        title }}</div>
      <div>{{ description }}</div>
    </div> -->
    <div
      class="[border-top:1px_dashed_rgba(5,5,5,0.06)] flex justify-center items-center py-12px gap-16px h-40px">
      <span class="i-design:copy cursor-pointer" @click="() => onCopy(code)" />
      <img v-show="!expand" class="w-16px cursor-pointer"
        src="https://gw.alipayobjects.com/zos/antfincdn/Z5c7kzvi30/expand.svg" alt="expand" @click="expand = !expand" />
      <img v-show="expand" class="w-16px cursor-pointer"
        src="https://gw.alipayobjects.com/zos/antfincdn/4zAaozCvUH/unexpand.svg" alt="unexpand"
        @click="expand = !expand" />
    </div>
    <div v-show="expand" class="[border-top:1px_dashed_rgba(5,5,5,0.06)]">
      <pre class='language-typescript !m-0 !bg-white !p-16px !flex'>
        <code class="!text-[var(--dark-color)] !p-0" v-html="codeHtml"></code>
      </pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-typescript'
import { nanoid } from 'nanoid'

interface Props {
  path: string
  iframe?: boolean
}
const props = defineProps<Props>()

let expand = ref(false)

let codeHtml = ref('')
let code = ref('')

// @ts-ignore
const codeModules = import.meta.glob('../../demos/*/**.tsx', { as: 'raw' })

onMounted(() => {
  codeModules[`../../demos/${props.path}.tsx`]().then(value => {
    codeHtml.value = Prism.highlight(value, Prism.languages.typescript, 'typescript')
    code.value = value
  })
})

function onCopy(text: string) {
  navigator.clipboard.writeText(text)
}
</script>