import { Show, type Component, type ParentProps, mergeProps } from 'solid-js'

interface SpinProps extends ParentProps {
  /**
   * 是否为加载中状态
   */
  spinning?: boolean
  size?: number
}

const Spin: Component<SpinProps> = _props => {
  const props = mergeProps(
    {
      size: 20,
    },
    _props,
  )

  return (
    <div>
      {props.children}
      <Show when={props.spinning}>
        <div class="flex items-center justify-center bg-[rgba(255,255,255,.5)]">
          <span
            class="i-ant-design:loading keyframes-spin [animation:spin_1s_linear_infinite] text-[var(--ant-color-primary)]"
            style={{ 'font-size': `${props.size}px` }}
          />
        </div>
      </Show>
    </div>
  )
}

export default Spin
