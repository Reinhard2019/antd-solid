import { type Accessor, createContext } from 'solid-js'
import { type CssVariables } from './types'
import { createCssVariables, getCssVariablesClass } from './utils'
import { lightSeedToken } from './seed'

const defaultCssVariables = createCssVariables(lightSeedToken)

const Context = createContext<{
  cssVariablesClass: string
  cssVariables: Accessor<CssVariables>
}>({
  cssVariablesClass: getCssVariablesClass(),
  cssVariables: () => defaultCssVariables,
})

export default Context
