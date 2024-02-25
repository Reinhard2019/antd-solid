import { For, type Component, createSignal } from 'solid-js'
import { RangeInput } from 'antd-solid'

const options = ['第1年', '第2年', '第3年', '第4年', '第5年']

const App: Component = () => {
  const [value, setValue] = createSignal<string[]>([])

  return (
    <>
      <div style={{ 'margin-bottom': '16px' }}>选择范围：{value().join('-')}</div>

      <RangeInput
        value={value()}
        onChange={setValue}
        placeholder="请选择"
        content={({ setSingleValue }) => (
          <div style={{ padding: '4px' }}>
            <For each={options}>
              {item => (
                <div
                  class="text-center cursor-pointer hover:bg-[var(--ant-select-option-active-bg)]"
                  onClick={() => {
                    setSingleValue(item)
                  }}
                >
                  {item}
                </div>
              )}
            </For>
          </div>
        )}
      />
    </>
  )
}

export default App
