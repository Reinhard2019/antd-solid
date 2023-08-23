import { Component, JSXElement, createSignal, mergeProps, untrack } from 'solid-js'
import Button from './Button'
import Tooltip from './Tooltip'

interface PopconfirmProps {
  title?: JSXElement
  content?: JSXElement
  children: JSXElement
  onCancel?: () => void
  onConfirm?: () => void
  /**
   * 确认按钮文字
   * 默认：确定
   */
  okText?: string
  /**
   * 取消按钮文字
   * 默认：取消
   */
  cancelText?: string
}

const Popconfirm: Component<PopconfirmProps> = props => {
  const mergedProps = mergeProps({ okText: '确定', cancelText: '取消' }, props)
  const [open, setOpen] = createSignal(false)

  return (
    <Tooltip
      mode="light"
      trigger="click"
      open={open()}
      onOpenChange={setOpen}
      content={
        <div>
          <div class="ant-mb-8px ant-flex ant-items-center">
            <span class="i-ant-design:exclamation-circle-fill ant-text-#faad14" />
            <span class="ant-ml-8px ant-text-[rgba(0,0,0,0.88)] ant-font-600">{mergedProps.title}</span>
          </div>

          <div class="ant-ml-22px ant-mb-8px ant-text-[rgba(0,0,0,0.88)]">{mergedProps.content}</div>

          <div class="ant-text-right">
            <Button
              class="ant-ml-8px"
              size="small"
              onClick={() => {
                setOpen(false)
                untrack(() => mergedProps.onCancel?.())
              }}
            >
              {mergedProps.cancelText}
            </Button>
            <Button
              class="ant-ml-8px"
              type="primary"
              size="small"
              onClick={() => {
                setOpen(false)
                untrack(() => mergedProps.onConfirm?.())
              }}
            >
              {mergedProps.okText}
            </Button>
          </div>
        </div>
      }
    >
      {mergedProps.children}
    </Tooltip>
  )
}

export default Popconfirm
