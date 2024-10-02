import { type Accessor, createMemo, useContext } from 'solid-js'
import { type ComponentSize } from '../types'
import ConfigProviderContext from '../ConfigProvider/context'

export default function useComponentSize(size: Accessor<ComponentSize | undefined>) {
  const { componentSize } = useContext(ConfigProviderContext)
  const _size = createMemo(() => size() ?? componentSize())
  return _size
}
