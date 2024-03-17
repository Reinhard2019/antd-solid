import { useVirtualList } from 'antd-solid'
import { type Component, For } from 'solid-js'

const App: Component = () => {
  let containerRef: HTMLDivElement | undefined
  let wrapperRef: HTMLDivElement | undefined

  const { list } = useVirtualList(() => Array.from(Array(99999).keys()), {
    containerTarget: () => containerRef!,
    wrapperTarget: () => wrapperRef!,
    itemSize: () => 60,
    layout: () => 'horizontal',
  })

  return (
    <>
      <div ref={containerRef} style={{ overflow: 'auto', border: '1px solid' }}>
        <div ref={wrapperRef}>
          <For each={list()}>
            {item => (
              <div
                style={{
                  width: '52px',
                  height: '300px',
                  display: 'inline-flex',
                  'justify-content': 'center',
                  'align-items': 'center',
                  border: '1px solid #e8e8e8',
                  'margin-right': '8px',
                }}
              >
                {item}
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}

export default App
