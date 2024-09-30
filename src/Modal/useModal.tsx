import { createSignal } from 'solid-js'
import Modal, { type ModalProps } from '.'

function useModal() {
  const [open, setOpen] = createSignal(false)
  const [modalProps, setModalProps] = createSignal<ModalProps>({})
  const modal = {
    warning: (props: ModalProps) => {
      setModalProps(props)
      setOpen(true)
    },
  }
  const getContextHolder = () => (
    <Modal
      width="416px"
      maskClosable={false}
      closeIcon={false}
      {...modalProps()}
      title={
        <div class="flex items-center gap-12px">
          <span class="i-ant-design:exclamation-circle text-22px text-[var(--ant-color-warning)]" />
          {modalProps().title}
        </div>
      }
      children={<div class="ml-34px">{modalProps().children}</div>}
      open={open()}
      onOk={() => {
        setOpen(false)
        modalProps().onOk?.()
      }}
      onCancel={() => {
        setOpen(false)
        modalProps().onCancel?.()
      }}
    />
  )
  return [modal, getContextHolder] as const
}

export default useModal
