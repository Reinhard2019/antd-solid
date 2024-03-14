import { createSignal, type Component } from 'solid-js'
import { type TransformValue, Transformer } from 'antd-solid'

const App: Component = () => {
  const [transformValue, setTransformValue] = createSignal<TransformValue>({
    width: 100,
    height: 100,
    rotate: 0,
  })
  return (
    <div
      style={{
        background: 'grey',
        height: '300px',
        position: 'relative',
      }}
    >
      <img
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        style={{
          width: `${transformValue().width}px`,
          height: `${transformValue().height}px`,
          transform: `translate(-50%, -50%) rotate(${transformValue().rotate}deg)`,
          position: 'absolute',
          top: '50%',
          left: '50%',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Transformer value={transformValue()} onChange={setTransformValue} />
      </div>
    </div>
  )
}

export default App
