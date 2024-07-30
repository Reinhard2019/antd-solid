import { type Accessor, createContext, type Setter } from 'solid-js'
import { type CollapseProps } from '.'

const CollapseContext = createContext(
  {} as {
    bordered: Accessor<boolean>
    size: Accessor<Required<CollapseProps>['size']>
    activeItems: Accessor<any[]>
    setActiveItems: Setter<any[]>
  },
)

export const CollapseItemContext = createContext(
  {} as {
    item: any
  },
)

export default CollapseContext
