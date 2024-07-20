import { type Accessor, createContext } from 'solid-js'
import { type CssVariables } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { lightSeedToken } from './seed'

const defaultCssVariables = createCssVariables(lightSeedToken)

const ConfigProviderContext = createContext({
  theme: (() => 'light') as Accessor<'light' | 'dark'>,
  cssVariablesClass: getCssVariablesClass(),
  cssVariables: (() => defaultCssVariables) as Accessor<CssVariables>,
  componentSize: (() => 'middle') as Accessor<'small' | 'middle' | 'large'>,
})

export default ConfigProviderContext
