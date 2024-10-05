import { onMount, type Component } from 'solid-js'
import { Button, Tooltip } from 'antd-solid'

const App: Component = () => {
  onMount(() => {
    document.documentElement.scrollTop = document.documentElement.clientHeight
    document.documentElement.scrollLeft = document.documentElement.clientWidth
  })

  return (
    <div
      style={{
        width: '300vw',
        height: '300vh',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }}
    >
      <Tooltip content="Thanks for using antd. Have a nice day !" open>
        <Button type="primary">Scroll The Window</Button>
      </Tooltip>
    </div>
  )
}

export default App
