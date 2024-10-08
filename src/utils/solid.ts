import { type JSXElement, type JSX, untrack, type Ref } from 'solid-js'
import { isNil } from 'lodash-es'
import { type StringOrJSXElement } from '../types'

/**
 * 判断 JSXElement 是否是基础类型
 * @param value JSXElement
 * @returns
 */
export function isBaseType(
  value: JSXElement,
): value is string | number | boolean | null | undefined {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  )
}

export function dispatchEventHandlerUnion<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  e: E & {
    currentTarget: T
    target: Element
  },
) {
  if (isNil(handler)) {
    return
  }

  if (typeof handler === 'function') {
    handler(e)
    return
  }

  handler[0](handler[1], e)
}

export function unwrapStringOrJSXElement(value: StringOrJSXElement): JSXElement {
  return typeof value === 'function' ? value() : value
}

export function setRef<T>(props: { ref?: Ref<T> }, value: T | null) {
  untrack(() => {
    if (typeof props.ref === 'function') {
      ;(props.ref as (v: T | null) => void)?.(value)
    }
  })
}

export function unwrapFunction<T>(value: T | (() => T)): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function isEmptyJSXElement(element: JSXElement): boolean {
  return (
    element === undefined ||
    element === null ||
    typeof element === 'boolean' ||
    element === '' ||
    (Array.isArray(element) && element.length === 0)
  )
}
