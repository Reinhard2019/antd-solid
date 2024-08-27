import { type Accessor, For, type JSX } from 'solid-js'
import { type StringOrJSXElement } from '../types'
import Element from '../Element'
import { unwrapStringOrJSXElement } from '../utils/solid'

interface SpaceProps<T extends readonly any[], U extends JSX.Element> {
  each: T | undefined | null | false
  fallback?: JSX.Element
  children: (item: T[number], index: Accessor<number>) => U
  /**
   * 设置拆分
   */
  split: StringOrJSXElement
}

function Space<T extends readonly any[], U extends JSX.Element>(props: SpaceProps<T, U>) {
  return (
    <Element>
      <For {...props}>
        {(item, index) => (
          <>
            {index() !== 0 && unwrapStringOrJSXElement(props.split)}
            {props.children(item, index)}
          </>
        )}
      </For>
    </Element>
  )
}

export default Space
