---
outline: deep
---

# DatePicker 日期选择框 {#title}

输入或选择日期的控件。

## 代码演示

### 基本用法

最简单的用法，在浮层中可以选择或者输入日期。

<Code path="date-picker/Base" />

### 范围选择器

通过设置 `picker` 属性，指定范围选择器类型。

<Code path="date-picker/RangePicker" />

## API

### DatePicker

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| allowClear      | 支持清除		       | boolean | false |
| options   | 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能        | { label, value }[] | - |
| placeholder   | 选择框默认文本        | string | - |

</div>