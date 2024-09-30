import { render } from 'solid-js/web'
import Modal, { type ModalProps } from '.'

export interface MethodProps extends Pick<ModalProps, 'title' | 'children' | 'onOk' | 'onCancel'> {}

function warning(props: MethodProps) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const dispose = render(
    () => (
      <Modal
        width="416px"
        maskClosable={false}
        closeIcon={false}
        {...props}
        title={
          <div class="flex items-center gap-12px">
            <span class="i-ant-design:exclamation-circle text-22px text-[var(--ant-color-warning)]" />
            {props.title}
          </div>
        }
        children={<div class="ml-34px">{props.children}</div>}
        defaultOpen
        onOk={() => {
          document.body.removeChild(div)
          dispose()
          props.onOk?.()
        }}
        onCancel={() => {
          document.body.removeChild(div)
          dispose()
          props.onCancel?.()
        }}
      />
    ),
    div,
  )
}

export default warning
