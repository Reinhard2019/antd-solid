import { createSignal, type Component } from 'solid-js'
import { Checkbox } from 'antd-solid'

const options = ['Apple', 'Pear', 'Orange']

const App: Component = () => {
  const [checkedList, setCheckedList] = createSignal<string[]>([])

  return (
    <div>
      <Checkbox
        indeterminate={checkedList().length > 0}
        checked={checkedList().length === options.length}
        onChange={e => {
          setCheckedList(e.target.checked ? options : [])
        }}
      >
        Checkbox
      </Checkbox>

      <Checkbox.Group
        class="mt-16px"
        options={options}
        block
        value={checkedList()}
        onChange={setCheckedList}
      />
    </div>
  )
}

export default App
