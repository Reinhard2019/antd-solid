import {
  type ParentProps,
  type Component,
  createMemo,
  mergeProps,
  useContext,
  untrack,
  onMount,
} from 'solid-js'
import ConfigProviderContext from './context'
import { type SeedToken } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { darkSeedToken, lightSeedToken } from './seed'
import { type Locale } from '../locale'

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
  locale?: Locale
  /**
   * 初始化时样式是否挂载 body 上
   */
  mountBodyStyle?: boolean
}

function useConfig() {
  return useContext(ConfigProviderContext)
}

const ConfigProvider: Component<ConfigProviderProps> & {
  useConfig: typeof useConfig
} = _props => {
  const config = useConfig()
  const props = mergeProps(
    {
      theme: untrack(config.theme),
      locale: untrack(config.locale),
      componentSize: 'middle',
    } as const,
    _props,
  )
  const mergedToken = createMemo(() => ({
    ...(props.theme === 'dark' ? darkSeedToken : lightSeedToken),
    ...props.token,
  }))
  const cssVariables = createMemo(() => createCssVariables(mergedToken(), props.theme))
  const locale = createMemo(() => props.locale)
  const cssVariablesClass = getCssVariablesClass()

  onMount(() => {
    if (props.mountBodyStyle) {
      document.body.classList.add(cssVariablesClass)
    }
  })

  return (
    <ConfigProviderContext.Provider
      value={{
        theme: () => props.theme,
        cssVariablesClass,
        cssVariables,
        componentSize: () => props.componentSize,
        locale,
      }}
    >
      {props.children}
    </ConfigProviderContext.Provider>
  )
}

ConfigProvider.useConfig = useConfig

export default ConfigProvider
