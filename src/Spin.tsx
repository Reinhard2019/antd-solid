import { Show, type Component, type ParentProps } from 'solid-js'

interface SpinProps extends ParentProps {
  /**
   * 是否为加载中状态
   */
  spinning?: boolean
}

const Spin: Component<SpinProps> = props => {
  return (
    <div>
      {props.children}
      <Show when={props.spinning}>
        <div class="ant-flex ant-items-center ant-justify-center ant-bg-[rgba(255,255,255,.5)]">
          <span class="i-ant-design:loading keyframes-spin ant-[animation:spin_1s_linear_infinite] ant-text-32px ant-text-[var(--ant-color-primary)]" />
        </div>
      </Show>
    </div>
  )
}

export default Spin
