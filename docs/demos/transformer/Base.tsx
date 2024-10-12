import { createSignal, type Component, onMount } from 'solid-js'
import { type TransformValue, Transformer } from 'antd-solid'

const App: Component = () => {
  const [transformValue, setTransformValue] = createSignal<TransformValue>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotate: 0,
  })

  let container: HTMLDivElement | undefined
  onMount(() => {
    setTransformValue(v => ({
      ...v,
      x: (container!.clientWidth - v.width) / 2,
      y: (container!.clientHeight - v.height) / 2,
    }))
  })

  return (
    <div
      ref={container}
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
          transform: `translate(${transformValue().x}px, ${transformValue().y}px) rotate(${transformValue().rotate}deg)`,
          position: 'absolute',
        }}
      />
      <Transformer value={transformValue()} onChange={setTransformValue} />
    </div>
  )
}

export default App
