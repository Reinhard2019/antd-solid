import { type ParentProps, type Component, createMemo, mergeProps } from 'solid-js'
import Context from './context'
import { type SeedToken } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { darkSeedToken, lightSeedToken } from './seed'

interface ConfigProviderProps extends ParentProps {
  /**
   * 主题
   * 默认 'light'
   */
  theme?: 'light' | 'dark'
  token?: SeedToken
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
    <Context.Provider
      value={{ theme: () => props.theme, cssVariablesClass: getCssVariablesClass(), cssVariables }}
    >
      {props.children}
    </Context.Provider>
  )
}

export default ConfigProvider
