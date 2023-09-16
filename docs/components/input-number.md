---
outline: deep
---

# InputNumber 数字输入框 {#title}

通过鼠标或键盘，输入范围内的数值。

## 代码演示

<script lang="ts" setup>
import baseComponent from './input-number/Base.tsx'
import baseCode from './input-number/Base.tsx?raw'
import minMaxComponent from './input-number/MinMax.tsx'
import minMaxCode from './input-number/MinMax.tsx?raw'
</script>

### 基本用法

数字输入框。

<Code :component="baseComponent" :code="baseCode" />

### 最小值 & 最大值

你可以设定最小值和最大值。

<Code :component="minMaxComponent" :code="minMaxCode" />

## API

### Table

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| max      | 最大值			       | number | Infinity |
| min      | 最小值			       | number | -Infinity |

</div>