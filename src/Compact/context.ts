import { createContext } from 'solid-js'

const CompactContext = createContext<{
  compact: boolean
}>({
  compact: false,
})

export default CompactContext
