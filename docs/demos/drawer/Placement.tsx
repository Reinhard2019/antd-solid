import { createSignal, type Component } from 'solid-js'
import { Button, Drawer, Radio, type DrawerProps } from 'antd-solid'

const App: Component = () => {
  const [placement, setPlacement] = createSignal<DrawerProps['placement']>('right')

  const [open, setOpen] = createSignal(false)

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

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
        <Button type="primary" onClick={showDrawer}>
          Open
        </Button>
      </div>

      <Drawer title="Basic Modal" open={open()} onClose={onClose} placement={placement()}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default App
