import { mergeProps, type JSX, useContext } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import ConfigProviderContext from '../ConfigProvider/context'

export type ElementProps<T = JSX.HTMLAttributes<HTMLDivElement>> = T & {
  /**
   * 默认 'div'
   */
  tag?: string
  style?: JSX.CSSProperties
}

function Element<T = JSX.HTMLAttributes<HTMLDivElement>>(_props: ElementProps<T>) {
  const props = mergeProps(
    {
      tag: 'div',
    },
    _props,
  )
  const { cssVariables } = useContext(ConfigProviderContext)

  return (
    <Dynamic
      component={props.tag}
      {...props}
      style={{
        ...cssVariables(),
        ...props.style,
      }}
    />
  )
}

export default Element
