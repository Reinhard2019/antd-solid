---
outline: deep
---

# RangeInput 范围输入框 {#title}

用于输入范围文本。

## 代码演示

### 基本用法

范围输入框的基础用法。

<Code path="range-input/Base" />

### 可清空

注意只有选了值才能清空值。

<Code path="range-input/AllowClear" />

### 自定义状态

使用 `status` 为 Select 添加状态，可选 `error` 或者 `warning`。

<Code path="range-input/Status" />

## API

### RangeInput

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| allowClear      | 支持清除		       | boolean | false |
| options   | 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能        | { label, value }[] | - |
| placeholder   | 选择框默认文本        | string | - |

</div>