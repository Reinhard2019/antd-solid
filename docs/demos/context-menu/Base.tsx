import { ContextMenu } from 'antd-solid'
import { type Component } from 'solid-js'

const Base: Component = () => {
  return (
    <div
      onContextMenu={event => {
        ContextMenu.trigger(event, {
          items: [
            {
              key: '1',
              label: 'Menu Item 1',
            },
            {
              key: '2',
              label: 'Menu Item 2',
            },
            {
              key: '3',
              label: 'Menu Item 3',
              children: [
                {
                  key: '1',
                  label: 'Menu Item 1',
                },
                {
                  key: '2',
                  label: 'Menu Item 2',
                },
                {
                  key: '3',
                  label: 'Menu Item 3',
                },
              ],
            },
          ],
        })
      }}
      style={{
        background: 'rgb(245, 245, 245)',
        color: 'rgba(0, 0, 0, 0.45)',
        height: '200px',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
      }}
    >
      Right Click on here
    </div>
  )
}

export default Base
