import { type Accessor, createContext, type Setter } from 'solid-js'
import { type CollapseProps } from '.'

const CollapseContext = createContext(
  {} as {
    type: Accessor<Required<CollapseProps>['type']>
    size: Accessor<Required<CollapseProps>['size']>
    activeItems: Accessor<any[]>
    setActiveItems: Setter<any[]>
  },
)

export const CollapseItemContext = createContext(
  {} as {
    item: any
    index: Accessor<number>
  },
)

export default CollapseContext
