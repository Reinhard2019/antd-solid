import { type JSXElement, type Component, type JSX, useContext } from 'solid-js'
import ConfigProviderContext from '../ConfigProvider/context'
import PRESENTED_IMAGE_SIMPLE from './PRESENTED_IMAGE_SIMPLE'
import EmptySvg from './assets/EmptySvg'

export interface EmptyProps {
  description?: JSXElement
  class?: string
  style?: JSX.CSSProperties
}

const Empty: Component<EmptyProps> & {
  PRESENTED_IMAGE_SIMPLE: Component
} = props => {
  const { cssVariables } = useContext(ConfigProviderContext)

  return (
    <div {...props} style={{ ...cssVariables(), ...props.style }}>
      <div class="mb-[var(--ant-margin-xs)] flex justify-center">
        <EmptySvg />
      </div>
      <div class="text-[var(--ant-color-text)] text-center">{props.description ?? '暂无数据'}</div>
    </div>
  )
}

Empty.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE

export default Empty
