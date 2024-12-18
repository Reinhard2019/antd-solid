import { createSignal, type JSXElement, type Component, Show, createRenderEffect } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import CommandContext from './context'
import DelayShow from '../DelayShow'

/**
 * createCommand
 * @param component
 * @param contextHolder 如果为 true，则会返回 getContextHolder
 */
function createCommand<P extends {} = {}, T = void>(
  component: Component<P>,
): {
  show: (props?: P) => Promise<T>
}
function createCommand<P extends {} = {}, T = void>(
  component: Component<P>,
  contextHolder: true,
): {
  show: (props?: P) => Promise<T>
  getContextHolder: () => JSXElement
}
function createCommand<P extends {} = {}, T = void>(
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
  const [open, _setOpen] = createSignal(false)
  const [forceDestroy, setForceDestroy] = createSignal(false)
  const setOpen = (value: boolean) => {
    if (value) setForceDestroy(false)
    _setOpen(value)
  }
  const [props, setProps] = createSignal<P>({} as P)
  let resolve: (value: T) => void
  let reject: (reason?: any) => void
  let disposeRef: (() => void) | undefined
  const dispose = () => {
    setForceDestroy(true)
    disposeRef?.()
  }

  const hide = () => {
    setOpen(false)
  }
  const onOk = (value?: T) => {
    hide()
    resolve(value!)
  }
  const onCancel = () => {
    hide()
    reject()
  }

  // 监听关闭事件，自动销毁
  const onAutoDispose = () => {
    createRenderEffect(() => {
      if (!open()) dispose()
    })
  }

  const getContextHolder = () => (
    <DelayShow when={open()}>
      <Show when={!forceDestroy()}>
        <CommandContext.Provider
          value={{
            open,
            onOk,
            onCancel,
            dispose,
            onAutoDispose,
          }}
        >
          <Dynamic component={component} {...props()!} />
        </CommandContext.Provider>
      </Show>
    </DelayShow>
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
        const _dispose = render(getContextHolder, div)
        disposeRef = () => {
          document.body.removeChild(div)
          _dispose()
        }

        resolve = _resolve
        reject = _reject
      })
    },
  }
}

export default createCommand
