---
outline: deep
---

# Message 全局提示 {#title}

全局展示操作反馈信息。

## 代码演示

### Hooks 调用（推荐）

通过 `message.useMessage` 创建支持读取 context 的 `contextHolder`。请注意，我们推荐通过顶层注册的方式代替 `message` 静态方法，因为静态方法无法消费上下文，因而 ConfigProvider 的数据也不会生效。

<Code path="message/Hooks" />

### 静态方法

静态方法

<Code path="message/Static" />

## API

### Message

<div class="vp-table">

| 参数      | 说明 | 类型 | 默认值
| ----------- | ----------- | ----------- | ----------- |

</div>