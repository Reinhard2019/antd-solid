import { type Accessor, createContext } from 'solid-js'
import { type CssVariables } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { lightSeedToken } from './seed'

const defaultCssVariables = createCssVariables(lightSeedToken)

const Context = createContext({
  theme: (() => 'light') as Accessor<'light' | 'dark'>,
  cssVariablesClass: getCssVariablesClass(),
  cssVariables: (() => defaultCssVariables) as Accessor<CssVariables>,
})

export default Context
