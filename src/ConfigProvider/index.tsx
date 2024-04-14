import { type ParentProps, type Component, createMemo, mergeProps, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import Context from './context'
import { type SeedToken } from './types'
import { createCssVariables } from './utils'
import { darkSeedToken, lightSeedToken } from './seed'

interface ConfigProviderProps extends ParentProps {
  /**
   * 主题
   * 默认 'light'
   */
  theme?: 'light' | 'dark'
  token?: SeedToken
  /**
   * 被渲染成的元素，例如 'div'
   * 默认为空
   */
  tag?: string
}

const ConfigProvider: Component<ConfigProviderProps> = _props => {
  const props = mergeProps(
    {
      theme: 'light',
    } as const,
    _props,
  )
  const mergedToken = createMemo(() => ({
    ...(props.theme === 'dark' ? darkSeedToken : lightSeedToken),
    ...props.token,
  }))
  const cssVariables = createMemo(() => createCssVariables(mergedToken(), props.theme))

  return (
    <Context.Provider value={{ cssVariables }}>
      <Show when={props.tag} fallback={props.children}>
        <Dynamic component={props.tag} style={cssVariables()}>
          {props.children}
        </Dynamic>
      </Show>
    </Context.Provider>
  )
}

export default ConfigProvider
