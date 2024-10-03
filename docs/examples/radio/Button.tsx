import { type Component } from 'solid-js'
import { Radio } from 'antd-solid'

const App: Component = () => {
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
      <Radio.Group
        defaultValue="a"
        optionType="button"
        options={[
          {
            label: 'Hangzhou',
            value: 'a',
          },
          {
            label: 'Shanghai',
            value: 'b',
          },
          {
            label: 'Beijing',
            value: 'c',
          },
          {
            label: 'Chengdu',
            value: 'd',
          },
        ]}
      />
      <Radio.Group
        defaultValue="a"
        optionType="button"
        options={[
          {
            label: 'Hangzhou',
            value: 'a',
          },
          {
            label: 'Shanghai',
            value: 'b',
            disabled: true,
          },
          {
            label: 'Beijing',
            value: 'c',
          },
          {
            label: 'Chengdu',
            value: 'd',
          },
        ]}
      />
      <Radio.Group
        disabled
        defaultValue="a"
        optionType="button"
        options={[
          {
            label: 'Hangzhou',
            value: 'a',
          },
          {
            label: 'Shanghai',
            value: 'b',
          },
          {
            label: 'Beijing',
            value: 'c',
          },
          {
            label: 'Chengdu',
            value: 'd',
          },
        ]}
      />
    </div>
  )
}

export default App
