import { type Accessor, createContext } from 'solid-js'
import { type CssVariables } from './types'
import { createCssVariables } from './utils'
import { lightSeedToken } from './seed'

const defaultCssVariables = createCssVariables(lightSeedToken)

const Context = createContext<{
  cssVariables: Accessor<CssVariables>
}>({
  cssVariables: () => defaultCssVariables,
})

export default Context
