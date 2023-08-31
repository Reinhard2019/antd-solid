---
outline: deep
---

# Button 按钮 {#title}

按钮用来触发一些操作。

## 代码演示

<script lang="ts" setup>
import baseComponent from './button/Base.tsx'
import baseCode from './button/Base.tsx?raw'

import dangerComponent from './button/Danger.tsx'
import dangerCode from './button/Danger.tsx?raw'
</script>

### 按钮类型

按钮有五种类型：主按钮、次按钮、虚线按钮、文本按钮和链接按钮。主按钮在同一个操作区域最多出现一次。

<Code :component="baseComponent" :code="baseCode" />

### 危险按钮

在 4.0 之后，危险成为一种按钮属性而不是按钮类型。

<Code :component="dangerComponent" :code="dangerCode" />

## API

### Button

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| allowClear      | 支持清除		       | boolean | false |
| options   | 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能        | { label, value }[] | - |
| placeholder   | 选择框默认文本        | string | - |

</div>