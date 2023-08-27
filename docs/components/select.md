---
outline: deep
---

# Select 选择器 {#title}

下拉选择器。

## 代码演示

<script lang="ts" setup>
import baseComponent from './select/Base.tsx'
import baseCode from './select/Base.tsx?raw'
import allowClearComponent from './select/AllowClear.tsx'
import allowClearCode from './select/AllowClear.tsx?raw '
</script>

### 基本用法

选择器的基础用法。

<Code :component="baseComponent" :code="baseCode" />

### 可清空

注意只有选了值才能清空值。

<Code :component="allowClearComponent" :code="allowClearCode" />

## API

### Table

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| allowClear      | 支持清除		       | boolean | false |
| options   | 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能        | { label, value }[] | - |
| placeholder   | 选择框默认文本        | string | - |

</div>