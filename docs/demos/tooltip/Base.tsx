import { type Component } from 'solid-js'
import { Tooltip } from 'antd-solid'

const Index: Component = () => {
  return (
    <Tooltip content="prompt text">
      <span>Tooltip will show on mouse enter.</span>
    </Tooltip>
  )
}

export default Index
