import { type Component } from 'solid-js'
import { Button, Compact, Input, InputNumber } from 'antd-solid'

const Index: Component = () => {
  return (
    <div
      style={{
        display: 'grid',
        gap: '8px',
      }}
    >
      <Compact>
        <Button type="primary" style={{ width: '33.3%' }}>
          左
        </Button>
        <Button type="primary" style={{ width: '33.3%' }}>
          中
        </Button>
        <Button type="primary" style={{ width: '33.3%' }}>
          有
        </Button>
      </Compact>
      <Compact>
        <Button style={{ width: '33.3%' }}>左</Button>
        <Button style={{ width: '33.3%' }}>中</Button>
        <Button style={{ width: '33.3%' }}>有</Button>
      </Compact>
      <Compact>
        <Input rootStyle={{ width: '20%' }} />
        <InputNumber rootStyle={{ width: '30%' }} />
        <Input rootStyle={{ width: '20%' }} />
      </Compact>
      <Compact>
        <Input rootStyle={{ width: '50%' }} prefix="$" suffix=".00" />
        <Input rootStyle={{ width: '50%' }} prefix="$" suffix=".00" />
      </Compact>
      <Compact>
        <Input rootStyle={{ width: '50%' }} addonBefore="$" addonAfter=".00" />
        <Input rootStyle={{ width: '50%' }} addonBefore="$" addonAfter=".00" />
      </Compact>
    </div>
  )
}

export default Index
