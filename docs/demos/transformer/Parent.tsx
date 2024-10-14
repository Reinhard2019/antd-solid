import { createSignal, onMount, type Component } from 'solid-js'
import { type TransformValue, Transformer, type TransformerProps } from 'antd-solid'

function degToRad(degrees: number) {
  return (degrees / 180) * Math.PI
}

function createSkewDOMMatrix(sx: number, sy: number) {
  return new DOMMatrix([1, Math.tan(degToRad(sy)), Math.tan(degToRad(sx)), 1, 0, 0])
}

const App: Component = () => {
  const [transformValue, setTransformValue] = createSignal<TransformValue>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotate: 30,
  })

  const skewX = 10
  const skewY = 15
  const scaleX = 2
  const scaleY = 3
  const transformOrigin: TransformerProps['transformOrigin'] = ['70%', '35%']

  let container: HTMLDivElement | undefined
  onMount(() => {
    setTransformValue(v => ({
      ...v,
      x: (container!.clientWidth - v.width) / 2,
      y: (container!.clientHeight - v.height) / 2,
    }))
  })

  const parentTransform = new DOMMatrix()
    .rotate(30)
    .scale(0.5, 0.7)
    .multiply(createSkewDOMMatrix(10, -20))

  return (
    <div
      ref={container}
      style={{
        background: 'grey',
        height: '300px',
        position: 'relative',
        'transform-origin': '30% 30%',
        transform: parentTransform.toString(),
      }}
    >
      <img
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        style={{
          width: `${transformValue().width}px`,
          height: `${transformValue().height}px`,
          'transform-origin': transformOrigin.join(' '),
          transform: `translate(${transformValue().x}px, ${transformValue().y}px) rotate(${transformValue().rotate}deg) scale(${scaleX}, ${scaleY}) skew(${skewX}deg, ${skewY}deg)`,
          position: 'absolute',
        }}
      />
      <Transformer
        value={transformValue()}
        onChange={setTransformValue}
        skewX={skewX}
        skewY={skewY}
        scaleX={scaleX}
        scaleY={scaleY}
        transformOrigin={transformOrigin}
        parentTransform={parentTransform}
      />
    </div>
  )
}

export default App
