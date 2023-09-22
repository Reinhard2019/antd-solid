---
outline: deep
---

# Input 输入框 {#title}

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 代码演示

<script lang="ts" setup>
import baseComponent from './input/Base.tsx'
import baseCode from './input/Base.tsx?raw'
import addonBeforeAndAfterComponent from './input/AddonBeforeAndAfter.tsx'
import addonBeforeAndAfterCode from './input/AddonBeforeAndAfter.tsx?raw'
import textAreaComponent from './input/TextArea.tsx'
import textAreaCode from './input/TextArea.tsx?raw'
import prefixAndSuffixComponent from './input/PrefixAndSuffix.tsx'
import prefixAndSuffixCode from './input/PrefixAndSuffix.tsx?raw'
import statusComponent from './input/Status.tsx'
import statusCode from './input/Status.tsx?raw'
</script>

### 基本用法

基本用法。

<Code :component="baseComponent" :code="baseCode" />

### 前置/后置标签

用于配置一些固定组合。

<Code :component="addonBeforeAndAfterComponent" :code="addonBeforeAndAfterCode" />

### 文本域

用于多行输入。

<Code :component="textAreaComponent" :code="textAreaCode" />

### 前缀和后缀

在输入框上添加前缀或后缀图标。

<Code :component="prefixAndSuffixComponent" :code="prefixAndSuffixCode" />

### 自定义状态

使用 `status` 为 Input 添加状态，可选 `error` 或者 `warning`。

<Code :component="statusComponent" :code="statusCode" />

## API

### Input

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| status      | 设置校验状态 | 'error' \| 'warning' | - |

</div>