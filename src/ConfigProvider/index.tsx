import { type ParentProps, type Component, createMemo, mergeProps, useContext } from 'solid-js'
import ConfigProviderContext from './context'
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
  /**
   * 设置 antd 组件大小
   * 默认 'middle'
   */
  componentSize?: 'small' | 'middle' | 'large'
}

function useConfig() {
  return useContext(ConfigProviderContext)
}

const ConfigProvider: Component<ConfigProviderProps> & {
  useConfig: typeof useConfig
} = _props => {
  const props = mergeProps(
    {
      theme: 'light',
      componentSize: 'middle',
    } as const,
    _props,
  )
  const mergedToken = createMemo(() => ({
    ...(props.theme === 'dark' ? darkSeedToken : lightSeedToken),
    ...props.token,
  }))
  const cssVariables = createMemo(() => createCssVariables(mergedToken(), props.theme))

  return (
    <ConfigProviderContext.Provider
      value={{
        theme: () => props.theme,
        cssVariablesClass: getCssVariablesClass(),
        cssVariables,
        componentSize: () => props.componentSize,
      }}
    >
      {props.children}
    </ConfigProviderContext.Provider>
  )
}

ConfigProvider.useConfig = useConfig

export default ConfigProvider
