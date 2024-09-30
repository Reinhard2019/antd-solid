import { createSignal, type JSXElement, type Component } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import ModalContext from './context'

/**
 * createModal
 * @param component
 * @param contextHolder 如果为 true，则会返回 getContextHolder
 */
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
): {
  show: (props?: P) => Promise<T>
}
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
  contextHolder: true,
): {
  show: (props?: P) => Promise<T>
  getContextHolder: () => JSXElement
}
function createModal<P extends {} = {}, T = void>(
  component: Component<P>,
  contextHolder?: true,
):
  | {
    show: (props?: P) => Promise<T>
  }
  | {
    show: (props?: P) => Promise<T>
    getContextHolder: () => JSXElement
  } {
  const [open, setOpen] = createSignal(false)
  const [props, setProps] = createSignal<P>({} as P)
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  let dispose: (() => void) | undefined

  const hide = () => {
    setOpen(false)
    dispose?.()
  }
  const onOk = (value?: T | PromiseLike<T>) => {
    hide()
    resolve(value!)
  }
  const onCancel = () => {
    hide()
    // eslint-disable-next-line prefer-promise-reject-errors
    reject()
  }
  const getContextHolder = () => (
    <ModalContext.Provider
      value={{
        open,
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        onOk: onOk as (value: void | PromiseLike<void>) => Promise<unknown> | void,
        onCancel,
      }}
    >
      <Dynamic component={component} {...props()!} />
    </ModalContext.Provider>
  )

  if (contextHolder) {
    return {
      async show(_props?: P) {
        setProps((_props as any) ?? {})
        setOpen(true)
        return await new Promise<T>((_resolve, _reject) => {
          resolve = _resolve
          reject = _reject
        })
      },
      getContextHolder,
    }
  }

  return {
    async show(_props?: P) {
      if (_props) setProps(_props as any)
      setOpen(true)
      return await new Promise<T>((_resolve, _reject) => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        dispose = render(getContextHolder, div)

        resolve = _resolve
        reject = _reject
      })
    },
  }
}

export default createModal
