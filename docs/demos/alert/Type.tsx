import { type Component } from 'solid-js'
import { Alert } from 'antd-solid'

const Index: Component = () => {
  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
      }}
    >
      <Alert type="success">Success Text</Alert>
      <Alert type="info">Info Text</Alert>
      <Alert type="warning">Warning Text</Alert>
      <Alert type="error">Error Text</Alert>
    </div>
  )
}

export default Index
