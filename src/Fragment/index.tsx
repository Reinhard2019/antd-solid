import { type Component, type ParentProps } from 'solid-js'

// 增加 Record<string, any> 是为了防止下面的情况不报错
// <Dynamic
//  component={is ? Other : Fragment}
//  otherProp={1}
// />
type FragmentProps = ParentProps & Record<string, any>

const Fragment: Component<FragmentProps> = props => {
  return <>{props.children}</>
}

export default Fragment
