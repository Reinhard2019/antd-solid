import { createContext } from 'solid-js'

const CollapseContext = createContext({
  /** 是否时手风琴列表 */
  list: false,
})

export default CollapseContext
