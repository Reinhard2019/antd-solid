import { type Component, type ParentProps } from 'solid-js'

const Fragment: Component<ParentProps> = props => {
  return <>{props.children}</>
}

export default Fragment
