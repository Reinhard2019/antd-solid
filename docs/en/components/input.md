---
outline: deep
---

# Input 输入框 {#title}

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 代码演示

### 基本用法

基本用法。

<Code path="input/Base" />

### 前置/后置标签

用于配置一些固定组合。

<Code path="input/AddonBeforeAndAfter" />

### 文本域

用于多行输入。

<Code path="input/TextArea" />

### 前缀和后缀

在输入框上添加前缀或后缀图标。

<Code path="input/PrefixAndSuffix" />

### 可清空

让输入值可以清除（当有值的时候）。

<Code path="input/AllowClear" />

### 不可用状态

Input 不可用状态

<Code path="input/Disabled" />

### 自定义状态

使用 `status` 为 Input 添加状态，可选 `error` 或者 `warning`。

<Code path="input/Status" />

## API

### Input

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |
| status      | 设置校验状态 | 'error' \| 'warning' | - |

</div>