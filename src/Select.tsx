import {
  type JSXElement,
  type Component,
  For,
  createSelector,
  createSignal,
  Show,
  createMemo,
} from 'solid-js'
import Tooltip from './Tooltip'
import { type ID } from './types'
import createControllableValue from './hooks/createControllableValue'
import cs from 'classnames'
import { useClickAway } from './hooks'

interface SelectOption {
  label: JSXElement
  value: ID
}

interface SelectProps {
  value?: ID
  onChange?: (value: ID) => void
  options: SelectOption[]
  placeholder?: string
  allowClear?: boolean
}

const Select: Component<SelectProps> = props => {
  let select: HTMLDivElement

  const [value, setValue] = createControllableValue<ID | undefined>(props)
  const [option, _setOption] = createSignal<SelectOption>()
  const setOption = (_option: SelectOption | undefined) => {
    setValue(_option?.value)
    _setOption(_option)
  }
  const selectedValue = createSelector(value)

  const [open, setOpen] = createSignal(false)
  useClickAway(
    () => setOpen(false),
    () => select!,
  )

  const [width, setWidth] = createSignal(0)
  const [hover, setHover] = createSignal(false)
  const showClearBtn = createMemo(() => props.allowClear && hover() && option())

  return (
    <Tooltip
      mode="light"
      open={open()}
      onOpenChange={setOpen}
      trigger={[]}
      placement="bottomLeft"
      arrow={false}
      contentWrapStyle={{
        padding: 0,
      }}
      content={close => (
        <div class="ant-bg-white ant-w-200px" style={{ width: `${width()}px` }}>
          <For each={props.options}>
            {item => (
              <div
                class={cs(
                  'ant-box-content ant-px-12px ant-py-5px ant-h-22px ant-leading-22px hover:ant-bg-[var(--hover-bg-color)]',
                  selectedValue(item.value) ? '!ant-bg-[var(--active-bg-color)]' : '',
                )}
                onClick={() => {
                  setOption(item)
                  close()
                }}
              >
                {item.label}
              </div>
            )}
          </For>
        </div>
      )}
    >
      <div
        ref={select!}
        class="ant-h-30px ant-leading-30px ant-rounded-6px ant-[border:1px_solid_var(--border-color)] ant-box-content ant-px-11px focus:ant-[border-color:var(--primary-color)]"
        tabIndex="0"
        onClick={e => {
          setOpen(true)
          setWidth(e.currentTarget.offsetWidth)
          e.currentTarget.focus()
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          '--ant-arrow-color': 'rgba(146, 146, 146, 1)',
          '--ant-clear-color': 'rgba(146, 146, 146, 1)',
          '--ant-clear-color-hover': 'rgba(194, 194, 194, 1)',
        }}
      >
        <div class="ant-relative ant-h-full">
          <Show
            when={option()}
            fallback={
              <input
                class="ant-h-full ant-w-full ant-float-left"
                readOnly
                placeholder={props.placeholder}
              />
            }
          >
            <div>{option()!.label}</div>
          </Show>

          <div class="ant-absolute ant-top-0 ant-bottom-0 ant-right-0">
            <Show when={showClearBtn()} fallback={<span class="i-ant-design:down-outlined ant-text-[var(--ant-allow-color)]" />}>
              <span
                class="i-ant-design:close-circle-filled ant-cursor-pointer ant-text-[var(--ant-clear-color)] hover:ant-text-[var(--ant-clear-color-hover)]"
                onClick={e => {
                  e.stopPropagation()
                  setOption(undefined)
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

export default Select
