import { type Component } from 'solid-js'
import { Select } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <Select
          placeholder="Outlined"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
        <Select
          multiple
          defaultValue={['lucy']}
          placeholder="Outlined"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <Select
          placeholder="Filled"
          variant="filled"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
        <Select
          multiple
          defaultValue={['lucy']}
          placeholder="Filled"
          variant="filled"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <Select
          placeholder="Borderless"
          variant="borderless"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
        <Select
          multiple
          defaultValue={['lucy']}
          placeholder="Borderless"
          variant="borderless"
          style={{ flex: 1 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
      </div>
    </div>
  )
}

export default App
