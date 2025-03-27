import { type JSXElement, type JSX } from 'solid-js'

export type Key = string | number

export type StringOrJSXElement = JSXElement | (() => JSXElement)

export interface StyleProps {
  class?: string
  style?: JSX.CSSProperties
}

export interface RootStyleProps {
  rootClass?: string
  rootStyle?: JSX.CSSProperties
}

export type ComponentSize = 'small' | 'middle' | 'large'
