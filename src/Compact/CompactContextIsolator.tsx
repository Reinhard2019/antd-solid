import { type Component, type ParentProps } from 'solid-js'
import CompactContext from './context'

const CompactContextIsolator: Component<ParentProps> = props => {
  return (
    <CompactContext.Provider value={{ compact: false }}>{props.children}</CompactContext.Provider>
  )
}

export default CompactContextIsolator
