import {
  type Component,
  type JSXElement,
  createSignal,
  mergeProps,
  untrack,
  splitProps,
} from 'solid-js'
import Button from '../Button'
import Tooltip, { type TooltipProps } from '../Tooltip'

interface PopconfirmProps extends Pick<TooltipProps, 'placement' | 'arrow' | 'getPopupContainer'> {
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
  const [tooltipProps] = splitProps(props, ['placement', 'arrow', 'getPopupContainer'])
  const [open, setOpen] = createSignal(false)

  return (
    <Tooltip
      mode="light"
      trigger="click"
      open={open()}
      onOpenChange={setOpen}
      content={
        <div>
          <div class="mb-8px flex items-center">
            <span class="i-ant-design:exclamation-circle-fill text-#faad14" />
            <span class="ml-8px text-[rgba(0,0,0,0.88)] font-600">{mergedProps.title}</span>
          </div>

          <div class="ml-22px mb-8px text-[rgba(0,0,0,0.88)]">{mergedProps.content}</div>

          <div class="text-right">
            <Button
              class="ml-8px"
              size="small"
              onClick={() => {
                setOpen(false)
                untrack(() => mergedProps.onCancel?.())
              }}
            >
              {mergedProps.cancelText}
            </Button>
            <Button
              class="ml-8px"
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
      {...tooltipProps}
    >
      {mergedProps.children}
    </Tooltip>
  )
}

export default Popconfirm
