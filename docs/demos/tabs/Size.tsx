import { createSignal, type Component } from 'solid-js'
import { type ComponentSize, Radio, Tabs } from 'antd-solid'

const App: Component = () => {
  const [size, setSize] = createSignal<ComponentSize>('middle')

  return (
    <div>
      <Radio.Group
        value={size()}
        onChange={e => {
          setSize(e.target.value as ComponentSize)
        }}
        optionType="button"
        options={[
          {
            label: 'Small',
            value: 'small',
          },
          {
            label: 'Middle',
            value: 'middle',
          },
          {
            label: 'Large',
            value: 'large',
          },
        ]}
        style={{ 'margin-bottom': '16px' }}
      />
      <Tabs
        defaultActiveKey="1"
        size={size()}
        style={{ 'margin-bottom': '32px' }}
        items={new Array(3).fill(null).map((_, i) => {
          const id = String(i + 1)
          return {
            label: `Tab ${id}`,
            key: id,
            children: `Content of tab ${id}`,
          }
        })}
      />
      <Tabs
        defaultActiveKey="1"
        type="card"
        size={size()}
        items={new Array(3).fill(null).map((_, i) => {
          const id = String(i + 1)
          return {
            label: `Card Tab ${id}`,
            key: id,
            children: `Content of card tab ${id}`,
          }
        })}
      />
    </div>
  )
}

export default App
