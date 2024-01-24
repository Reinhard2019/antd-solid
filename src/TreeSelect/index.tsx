import { splitProps, type JSXElement, untrack, createMemo } from 'solid-js'
import { type Key, type StringOrJSXElement } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import { get, isEmpty } from 'lodash-es'
import Tree, { type TreeProps, type TreeNode } from '../Tree'
import SelectInput, { type SelectInputProps } from '../Select/SelectInput'
import { unwrapStringOrJSXElement } from '../utils/solid'

export interface TreeSelectProps<T extends {} = TreeNode>
  extends Omit<SelectInputProps<T>, 'optionLabelRender' | 'content'>,
  Omit<TreeProps<T>, 'fieldNames'> {
  /**
   * 自定义节点 label、value、children 的字段
   * 默认 { label: 'label', value: 'value', children: 'children' }
   */
  fieldNames?: {
    label?: string | ((node: T) => JSXElement)
    value?: string | ((node: T) => Key)
    children?: string | ((node: T) => T[] | undefined)
  }
}

const TreeSelect = <T extends {} = TreeNode>(props: TreeSelectProps<T>) => {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'disabled',
    'placeholder',
  ])

  const fieldNames = Object.assign(
    {
      label: 'label' as string | ((node: T) => JSXElement),
      value: 'value' as string | ((node: T) => Key),
      children: 'children' as string | ((node: T) => T[] | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getLabel = (node: T): JSXElement => {
    const labelFieldName = fieldNames.label
    return typeof labelFieldName === 'function'
      ? labelFieldName(node)
      : unwrapStringOrJSXElement(get(node, labelFieldName) as StringOrJSXElement)
  }
  const getValue = (node: T): Key => {
    const valueFieldName = fieldNames.value
    return typeof valueFieldName === 'function' ? valueFieldName(node) : get(node, valueFieldName)
  }
  const getChildren = (node: T): T[] | undefined => {
    const childrenFieldName = fieldNames.children
    return typeof childrenFieldName === 'function'
      ? childrenFieldName(node)
      : get(node, childrenFieldName)
  }

  const optionMap = createMemo(() => {
    const map = new Map<Key, T>()
    // const checkedKeyDict = Object.fromEntries(checkedKeys().map(k => [k, true]))

    const treeForEach = (list: T[] | undefined) => {
      list?.forEach(item => {
        const key = getValue(item)
        map.set(key, item)

        const children = getChildren(item)
        if (!isEmpty(children)) {
          treeForEach(children!)
        }
      })
    }
    treeForEach(props.treeData)

    return map
  })

  const [value, setValue] = createControllableValue<Key[] | undefined>(props, {
    defaultValue: [],
  })

  return (
    <SelectInput
      {...selectInputProps}
      optionLabelRender={v => getLabel(optionMap().get(v)!)}
      value={value()}
      onChange={setValue}
      content={close => (
        <div class="px-4px py-8px">
          <Tree
            selectedKeys={value()}
            onSelect={selectedKeys => {
              console.log('selectedKeys', selectedKeys)
              setValue(selectedKeys)
              if (!props.multiple) close()
            }}
            treeData={props.treeData}
            multiple={props.multiple}
            blockNode
            fieldNames={{
              title: fieldNames.label,
              key: fieldNames.value,
              children: fieldNames.children,
            }}
          />
        </div>
      )}
    />
  )
}

export default TreeSelect
