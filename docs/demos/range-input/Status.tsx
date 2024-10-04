import { type Component } from 'solid-js'
import { RangeInput } from 'antd-solid'

const App: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <RangeInput
        placeholder={['开始', '结束']}
        status="error"
        content={() => <div>content</div>}
      />
      <RangeInput
        placeholder={['开始', '结束']}
        status="warning"
        content={() => <div>content</div>}
      />
    </div>
  )
}

export default App
