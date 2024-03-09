import { createSignal, type Component } from 'solid-js'
import { Tabs, Radio, type TabsProps } from 'antd-solid'

const App: Component = () => {
  const [placement, setPlacement] = createSignal<TabsProps['placement']>('top')
  const [type, setType] = createSignal<TabsProps['type']>('line')

  const items = [
    {
      key: '1',
      label: () => 'Tab 1',
      children: () => 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: () => 'Tab 2',
      children: () => 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: () => 'Tab 3',
      children: () => 'Content of Tab Pane 3',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <div>
        <span style={{ 'margin-right': '8px' }}>Position:</span>
        <Radio.Group
          value={placement()}
          onChange={e => setPlacement(e.target.value as TabsProps['placement'])}
          optionType="button"
          options={[
            {
              label: 'top',
              value: 'top',
            },
            {
              label: 'bottom',
              value: 'bottom',
            },
            {
              label: 'left',
              value: 'left',
            },
            {
              label: 'right',
              value: 'right',
            },
          ]}
        />
      </div>

      <div>
        <span style={{ 'margin-right': '8px' }}>Type:</span>
        <Radio.Group
          value={type()}
          onChange={e => setType(e.target.value as TabsProps['type'])}
          optionType="button"
          options={[
            {
              label: 'line',
              value: 'line',
            },
            {
              label: 'card',
              value: 'card',
            },
          ]}
        />
      </div>

      <Tabs placement={placement()} type={type()} items={items} />
    </div>
  )
}

export default App
