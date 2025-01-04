import {
  createSignal,
  type JSXElement,
  type Component,
  Show,
  createRenderEffect,
  untrack,
} from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import CommandContext from './context'
import DelayShow from '../DelayShow'

export interface BaseCommandIntance<
  P extends {} | undefined = undefined,
  R = void,
  S = P extends undefined ? () => Promise<R> : (props: P) => Promise<R>,
> {
  show: S
  hide: () => void
  dispose: () => void
  isOpen: () => boolean
}

/**
 * createCommand
 * @param component
 * @param contextHolder 如果为 true，则会返回 getContextHolder
 */
function createCommand<P extends {} | undefined = undefined, R = void>(
  component: Component<P>,
): BaseCommandIntance<P, R>
function createCommand<P extends {} | undefined = undefined, R = void>(
  component: Component<P>,
  contextHolder: true,
): BaseCommandIntance<P, R> & {
  getContextHolder: () => JSXElement
}
function createCommand<P extends {} | undefined = undefined, R = void>(
  component: Component<P>,
  contextHolder?: true,
):
  | BaseCommandIntance<P, R>
  | (BaseCommandIntance<P, R> & {
    getContextHolder: () => JSXElement
  }) {
  const [open, _setOpen] = createSignal(false)
  const [forceDestroy, setForceDestroy] = createSignal(false)
  const setOpen = (value: boolean) => {
    if (value) setForceDestroy(false)
    _setOpen(value)
  }
  const [props, setProps] = createSignal<P>()
  let resolve: (value: R) => void
  let reject: (reason?: any) => void
  let disposeRef: (() => void) | undefined
  const dispose = () => {
    _setOpen(false)
    setForceDestroy(true)
    disposeRef?.()
    disposeRef = undefined
  }

  const hide = () => {
    setOpen(false)
  }
  const onOk = (value?: R) => {
    hide()
    resolve(value!)
  }
  const onCancel = () => {
    hide()
    reject()
  }
  const isOpen = () => untrack(open)

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
    const show = (async (_props?: P) => {
      setProps(_props as any)
      setOpen(true)
      return await new Promise<R>((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })
    }) as BaseCommandIntance<P, R>['show']

    return {
      show,
      hide,
      dispose,
      isOpen,
      getContextHolder,
    }
  }

  const show = (async (_props?: P) => {
    setProps(_props as any)
    const alreadyOpen = isOpen()
    setOpen(true)
    return await new Promise<R>((_resolve, _reject) => {
      if (!alreadyOpen) {
        const div = document.createElement('div')
        document.body.appendChild(div)
        const renderDispose = render(getContextHolder, div)
        disposeRef = () => {
          renderDispose()
          document.body.removeChild(div)
        }
      }

      resolve = _resolve
      reject = _reject
    })
  }) as BaseCommandIntance<P, R>['show']

  return {
    show,
    hide,
    dispose,
    isOpen,
  }
}

export default createCommand
