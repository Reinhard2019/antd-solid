import { type Accessor, createContext } from 'solid-js'
import { type CssVariables } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { lightSeedToken } from './seed'
import zh_CN from '../locale/zh_CN'
import { type Locale } from '../locale'

const defaultCssVariables = createCssVariables(lightSeedToken)

const ConfigProviderContext = createContext({
  theme: (() => 'light') as Accessor<'light' | 'dark'>,
  cssVariablesClass: getCssVariablesClass(),
  cssVariables: (() => defaultCssVariables) as Accessor<CssVariables>,
  componentSize: (() => 'middle') as Accessor<'small' | 'middle' | 'large'>,
  locale: (() => zh_CN) as Accessor<Locale>,
})

export default ConfigProviderContext
