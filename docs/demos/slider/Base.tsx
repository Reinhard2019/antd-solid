import { createSignal, type Component } from 'solid-js'
import { Slider, Switch } from 'antd-solid'

const App: Component = () => {
  const [disabled, setDisabled] = createSignal(false)

  return (
    <div>
      <Slider defaultValue={30} disabled={disabled()} />
      <div>
        Disabled: <Switch size="small" checked={disabled()} onChange={setDisabled} />
      </div>
    </div>
  )
}

export default App
