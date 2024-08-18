import { mergeProps, type JSX, useContext, onMount } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import cs from 'classnames'
import ConfigProviderContext from '../ConfigProvider/context'
import { type StyleProps } from '../types'

export type ElementProps<T = JSX.HTMLAttributes<HTMLDivElement>> = T &
StyleProps & {
  /**
     * 默认 'div'
     */
  tag?: string
}

function Element<T = JSX.HTMLAttributes<HTMLDivElement>>(_props: ElementProps<T>) {
  const props = mergeProps(
    {
      tag: 'div',
    },
    _props,
  )
  const { theme, cssVariablesClass, cssVariables } = useContext(ConfigProviderContext)

  onMount(() => {
    let styleTag = document.head.querySelector(`[data-token-hash=${cssVariablesClass}]`)
    if (styleTag) return

    styleTag = document.createElement('style')
    styleTag.setAttribute('type', 'text/css')
    styleTag.setAttribute('data-token-hash', cssVariablesClass)
    const cssVariablesStr = Object.entries(cssVariables())
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')

    styleTag.innerHTML = `
        .${cssVariablesClass} {
          ${theme() === 'dark' ? 'color-scheme: dark;' : ''}

          ${cssVariablesStr}
        }
      `
    document.head.appendChild(styleTag)
  })

  return <Dynamic component={props.tag} {...props} class={cs(cssVariablesClass, props.class)} />
}

export default Element
