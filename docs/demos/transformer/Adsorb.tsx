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

  let containerRef: HTMLDivElement | undefined
  onMount(() => {
    setTransformValue(v => ({
      ...v,
      x: (containerRef!.clientWidth - v.width) / 2,
      y: (containerRef!.clientHeight - v.height) / 2,
    }))
  })

  return (
    <div
      ref={containerRef}
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
      <Transformer
        value={transformValue()}
        onChange={setTransformValue}
        adsorb={{
          width: containerRef?.clientWidth ?? 0,
          height: containerRef?.clientHeight ?? 0,
        }}
      />
    </div>
  )
}

export default App
