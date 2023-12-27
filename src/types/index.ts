import { type JSXElement } from 'solid-js'

export type Key = string | number

export type StringOrJSXElement = string | number | undefined | null | (() => JSXElement)
