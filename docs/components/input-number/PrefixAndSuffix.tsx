import { type Component } from 'solid-js'
import { InputNumber, Select } from 'antd-solid'

const selectBefore = (
  <Select
    defaultValue="add"
    options={[
      {
        label: '+',
        value: 'add',
      },
      {
        label: '-',
        value: 'minus',
      },
    ]}
    style={{ width: '60px' }}
  />
)
const selectAfter = (
  <Select
    defaultValue="USD"
    options={[
      {
        label: '$',
        value: 'USD',
      },
      {
        label: '€',
        value: 'EUR',
      },
      {
        label: '£',
        value: 'GBP',
      },
      {
        label: '¥',
        value: 'CNY',
      },
    ]}
    style={{ width: '60px' }}
  />
)

const AddonBeforeAndAfter: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <InputNumber addonBefore="+" addonAfter="$" defaultValue={100} />
      <InputNumber addonBefore={selectBefore} addonAfter={selectAfter} defaultValue={100} />
    </div>
  )
}

export default AddonBeforeAndAfter
