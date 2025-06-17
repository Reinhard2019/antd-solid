import { createSignal, onMount, type Component } from 'solid-js'
import { type TransformValue, Transformer } from 'antd-solid'

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

  const getTransform = (value: TransformValue, transformOrigin: DOMPoint) =>
    new DOMMatrix()
      .translate(value.x, value.y)
      .translate(transformOrigin.x, transformOrigin.y)
      .rotate(value.rotate)
      .scale(scaleX, scaleY)
      .multiply(createSkewDOMMatrix(skewX, skewY))
      .translate(-transformOrigin.x, -transformOrigin.y)

  let container: HTMLDivElement | undefined
  onMount(() => {
    setTransformValue(v => ({
      ...v,
      x: (container!.clientWidth - v.width) / 2,
      y: (container!.clientHeight - v.height) / 2,
    }))
  })

  const parentTransform = new DOMMatrix()
    .translate(100, 100)
    .rotate(30)
    .scale(0.5, 0.7)
    .multiply(createSkewDOMMatrix(10, -20))
    .translate(-100, -100)

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <div
        ref={container}
        style={{
          background: 'grey',
          height: '300px',
          position: 'relative',
          'transform-origin': 'top left',
          transform: parentTransform.toString(),
        }}
      >
        <img
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          style={{
            width: `${transformValue().width}px`,
            height: `${transformValue().height}px`,
            'transform-origin': 'top left',
            transform: getTransform(
              transformValue(),
              new DOMPoint(transformValue().width * 0.5, transformValue().height * 0.5),
            ).toString(),
            position: 'absolute',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
        }}
      >
        <Transformer
          value={transformValue()}
          onChange={setTransformValue}
          localToParentPoint={(point, _transformValue, transformOrigin) =>
            point.matrixTransform(getTransform(_transformValue, transformOrigin))
          }
          parentToLocalPoint={(point, _transformValue, transformOrigin) =>
            point.matrixTransform(getTransform(_transformValue, transformOrigin).inverse())
          }
          parentToWorldPoint={point => point.matrixTransform(parentTransform)}
          worldToParentPoint={point => point.matrixTransform(parentTransform.inverse())}
        />
      </div>
    </div>
  )
}

export default App
