import { type Component, type JSXElement, createSignal, untrack, splitProps } from 'solid-js'
import Button from '../Button'
import Tooltip, { type TooltipProps } from '../Tooltip'
import useLocale from '../hooks/useLocale'

export interface PopconfirmProps
  extends Pick<TooltipProps, 'placement' | 'arrow' | 'getPopupContainer'> {
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

export interface PopconfirmLocale {
  okText: string
  cancelText: string
}

const Popconfirm: Component<PopconfirmProps> = props => {
  const locale = useLocale()

  const [tooltipProps] = splitProps(props, ['placement', 'arrow', 'getPopupContainer'])
  const [open, setOpen] = createSignal(false)

  return (
    <Tooltip
      plain
      trigger="click"
      open={open()}
      onOpenChange={setOpen}
      content={() => (
        <div>
          <div class="mb-8px flex items-center">
            <span class="i-ant-design:exclamation-circle-fill text-#faad14" />
            <span class="ml-8px font-600">{props.title}</span>
          </div>

          <div class="ml-22px mb-8px">{props.content}</div>

          <div class="text-right">
            <Button
              class="ml-8px"
              size="small"
              onClick={() => {
                setOpen(false)
                untrack(() => props.onCancel?.())
              }}
            >
              {props.cancelText ?? locale()?.Popconfirm.cancelText}
            </Button>
            <Button
              class="ml-8px"
              type="primary"
              size="small"
              onClick={() => {
                setOpen(false)
                untrack(() => props.onConfirm?.())
              }}
            >
              {props.okText ?? locale()?.Popconfirm.okText}
            </Button>
          </div>
        </div>
      )}
      {...tooltipProps}
    >
      {props.children}
    </Tooltip>
  )
}

export default Popconfirm
