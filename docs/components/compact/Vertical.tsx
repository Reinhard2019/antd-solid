import { type Component } from 'solid-js'
import { Button, Compact } from 'antd-solid'

const Index: Component = () => {
  return (
    <Compact direction="vertical">
      <Button type="primary" style={{ width: '100px' }}>
        上
      </Button>
      <Button type="primary" style={{ width: '100px' }}>
        中
      </Button>
      <Button type="primary" style={{ width: '100px' }}>
        下
      </Button>
    </Compact>
  )
}

export default Index
