import { type Component } from 'solid-js'
import { Button, Tooltip } from 'antd-solid'

const buttonWidth = 80

const text = 'prompt text'

const App: Component = () => {
  return (
    <div>
      <div
        style={{
          'margin-inline-start': `${buttonWidth}px`,
          'white-space': 'nowrap',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Tooltip placement="topLeft" content={text}>
          <Button style={{ width: '80px' }}>TL</Button>
        </Tooltip>
        <Tooltip placement="top" content={text}>
          <Button style={{ width: '80px' }}>Top</Button>
        </Tooltip>
        <Tooltip placement="topRight" content={text}>
          <Button style={{ width: '80px' }}>TR</Button>
        </Tooltip>
      </div>
      <div
        style={{
          width: `${buttonWidth}px`,
          float: 'inline-start',
          display: 'flex',
          'flex-direction': 'column',
          gap: '8px',
        }}
      >
        <Tooltip placement="leftTop" content={text}>
          <Button style={{ width: '80px' }}>LT</Button>
        </Tooltip>
        <Tooltip placement="left" content={text}>
          <Button style={{ width: '80px' }}>Left</Button>
        </Tooltip>
        <Tooltip placement="leftBottom" content={text}>
          <Button style={{ width: '80px' }}>LB</Button>
        </Tooltip>
      </div>
      <div
        style={{
          width: `${buttonWidth}px`,
          'margin-inline-start': `${buttonWidth * 4 + 24}px`,
          display: 'flex',
          'flex-direction': 'column',
          gap: '8px',
        }}
      >
        <Tooltip placement="rightTop" content={text}>
          <Button style={{ width: '80px' }}>RT</Button>
        </Tooltip>
        <Tooltip placement="right" content={text}>
          <Button style={{ width: '80px' }}>Right</Button>
        </Tooltip>
        <Tooltip placement="rightBottom" content={text}>
          <Button style={{ width: '80px' }}>RB</Button>
        </Tooltip>
      </div>
      <div
        style={{
          'margin-inline-start': `${buttonWidth}px`,
          clear: 'both',
          'white-space': 'nowrap',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Tooltip placement="bottomLeft" content={text}>
          <Button style={{ width: '80px' }}>BL</Button>
        </Tooltip>
        <Tooltip placement="bottom" content={text}>
          <Button style={{ width: '80px' }}>Bottom</Button>
        </Tooltip>
        <Tooltip placement="bottomRight" content={text}>
          <Button style={{ width: '80px' }}>BR</Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default App
