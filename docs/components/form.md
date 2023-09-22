---
outline: deep
---

# Form 表单 {#title}

高性能表单控件，自带数据域管理。包含数据录入、校验以及对应样式。

## 代码演示

<script lang="ts" setup>
import baseComponent from './form/Base.tsx'
import baseCode from './form/Base.tsx?raw'
</script>

### 基本用法

基本的表单数据域控制展示，包含布局、初始化、验证、提交。

<Code :component="baseComponent" :code="baseCode" />

## API

### Form

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| layout      | 表单布局	 | `horizontal` \| `vertical` \| `inline` | `horizontal` |

</div>