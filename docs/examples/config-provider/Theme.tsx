import { createSignal, type Component } from 'solid-js'
import { Button, ConfigProvider } from 'antd-solid'

const App: Component = () => {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light')

  return (
    <ConfigProvider theme={theme()}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <Button onClick={() => setTheme('dark')}>深色</Button>
        <Button onClick={() => setTheme('light')}>浅色</Button>
      </div>
    </ConfigProvider>
  )
}

export default App
