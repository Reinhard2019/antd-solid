import { createSignal, type Component } from 'solid-js'
import { Button, Drawer, Radio, type DrawerInstance, type DrawerProps } from 'antd-solid'

const App: Component = () => {
  let ref: DrawerInstance | undefined
  const [placement, setPlacement] = createSignal<DrawerProps['placement']>('right')

  return (
    <>
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          gap: '16px',
        }}
      >
        <Radio.Group
          value={placement()}
          onChange={e => {
            setPlacement(e.target.value as DrawerProps['placement'])
          }}
          options={[
            { label: 'top', value: 'top' },
            { label: 'right', value: 'right' },
            { label: 'bottom', value: 'bottom' },
            { label: 'left', value: 'left' },
          ]}
        />
        <Button type="primary" onClick={ref?.open}>
          Open
        </Button>
      </div>

      <Drawer ref={ref!} title="Basic Modal" placement={placement()}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default App
