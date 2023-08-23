import React from 'react'
import { type JSXElement , type JSX } from 'solid-js'
import { isNil } from 'lodash-es'
import SolidToReact from './SolidToReact'

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

export function solidToReact(children: JSXElement) {
  return isBaseType(children)
    ? children
    : React.createElement(SolidToReact, {
      children,
    })
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

  handler[0](handler[1], e);
}