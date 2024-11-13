import { createSignal, type Component } from 'solid-js'
import { ColorPicker } from 'antd-solid'

const App: Component = () => {
  const [color, setColor] = createSignal('#1677ff')

  return (
    <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
      <ColorPicker value={color()} onChange={setColor} />
      <ColorPicker value={color()} onChangeComplete={setColor} />
    </div>
  )
}

export default App
