import { type Component } from 'solid-js'
import { Compact, Input, InputNumber } from 'antd-solid'

const Index: Component = () => {
  return (
    <div style={{
      display: 'grid',
      gap: '8px',
    }}>
      <Compact>
        <Input style={{ width: '20%' }} />
        <InputNumber style={{ width: '30%' }} />
        <Input style={{ width: '20%' }} />
      </Compact>
      <Compact>
        <Input style={{ width: '50%' }} prefix="$" suffix=".00" />
        <Input style={{ width: '50%' }} prefix="$" suffix=".00" />
      </Compact>
      <Compact>
        <Input style={{ width: '50%' }} addonBefore="$" addonAfter=".00" />
        <Input style={{ width: '50%' }} addonBefore="$" addonAfter=".00" />
      </Compact>
    </div>
  )
}

export default Index
