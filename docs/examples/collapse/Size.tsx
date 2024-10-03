import { type Component } from 'solid-js'
import { Collapse, Divider } from 'antd-solid'

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`

const App: Component = () => (
  <>
    <Divider orientation="left">Default Size</Divider>
    <Collapse
      type="card"
      items={[{ key: '1', label: 'This is default size panel header', children: text }]}
    />
    <Divider orientation="left">Small Size</Divider>
    <Collapse
      type="card"
      size="small"
      items={[{ key: '1', label: 'This is small size panel header', children: text }]}
    />
    <Divider orientation="left">Large Size</Divider>
    <Collapse
      type="card"
      size="large"
      items={[{ key: '1', label: 'This is large size panel header', children: text }]}
    />
  </>
)

export default App
