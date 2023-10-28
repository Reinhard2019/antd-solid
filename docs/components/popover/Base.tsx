import { type Component } from 'solid-js'
import { Button, Popover } from 'antd-solid'

const content = (
  <div style={{ width: '150px' }}>
    <p>Content</p>
    <p>Content</p>
  </div>
);

const Index: Component = () => {
  return (
    <Popover content={content} title="Title">
      <Button type="primary">Hover me</Button>
    </Popover>
  )
}

export default Index
