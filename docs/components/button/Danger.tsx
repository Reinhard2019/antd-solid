import { type Component } from 'solid-js'
import { Button } from 'antd-solid'

const Index: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
      }}
    >
      <Button type="primary" danger>Primary Button</Button>
      <Button danger>Default Button</Button>
      <Button type="dashed" danger>Dashed Button</Button>
      <Button type="text" danger>Text Button</Button>
      <Button type="link" danger>Link Button</Button>
    </div>
  )
}

export default Index
