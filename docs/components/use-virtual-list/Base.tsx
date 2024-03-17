import { useVirtualList } from 'antd-solid'
import { type Component, For } from 'solid-js'

const App: Component = () => {
  let containerRef: HTMLDivElement | undefined
  let wrapperRef: HTMLDivElement | undefined

  const { list } = useVirtualList(() => Array.from(Array(99999).keys()), {
    containerTarget: () => containerRef!,
    wrapperTarget: () => wrapperRef!,
    itemSize: () => 60,
  })

  return (
    <>
      <div ref={containerRef} style={{ height: '300px', overflow: 'auto', border: '1px solid' }}>
        <div ref={wrapperRef}>
          <For each={list()}>
            {item => (
              <div
                style={{
                  height: '52px',
                  display: 'flex',
                  'justify-content': 'center',
                  'align-items': 'center',
                  border: '1px solid #e8e8e8',
                  'margin-bottom': '8px',
                }}
              >
                Row: {item}
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}

export default App
