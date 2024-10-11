import { splitProps, type JSXElement, untrack, createMemo, Show } from 'solid-js'
import { get, isEmpty, isNil } from 'lodash-es'
import { type Key, type StringOrJSXElement } from '../types'
import createControllableValue from '../hooks/createControllableValue'
import Tree, { type TreeProps } from '../Tree'
import SelectInput, { type SelectInputProps } from '../SelectInput'
import { unwrapStringOrJSXElement } from '../utils/solid'
import Empty from '../Empty'

export interface TreeSelectNode<T = Key> {
  value: T
  label: JSXElement
  children?: TreeSelectNode[] | undefined
}

export interface TreeSelectProps<T = Key>
  extends Pick<
  SelectInputProps<Key>,
  'multiple' | 'allowClear' | 'class' | 'disabled' | 'placeholder' | 'status' | 'size'
  >,
  Pick<TreeProps<TreeSelectNode<T>>, 'treeData' | 'checkable' | 'checkStrategy'> {
  defaultValue?: T | T[] | undefined
  value?: T | T[] | undefined
  onChange?: (value: T | T[] | undefined) => void
  /**
   * 自定义节点 label、value、children 的字段
   * 默认 { label: 'label', value: 'value', children: 'children' }
   */
  fieldNames?: {
    label?: string | ((node: TreeSelectNode<T>) => JSXElement)
    value?: string | ((node: TreeSelectNode<T>) => T)
    children?: string | ((node: TreeSelectNode<T>) => Array<TreeSelectNode<T>> | undefined)
  }
  labelRender?: (options: TreeSelectNode<T> | undefined) => JSXElement
}

const TreeSelect = <T = Key>(props: TreeSelectProps<T>) => {
  const [selectInputProps] = splitProps(props, [
    'multiple',
    'allowClear',
    'class',
    'disabled',
    'placeholder',
    'status',
    'size',
  ])
  const [treeProps] = splitProps(props, ['treeData', 'checkable', 'checkStrategy'])

  const fieldNames = Object.assign(
    {
      label: 'label' as string | ((node: TreeSelectNode<T>) => JSXElement),
      value: 'value' as string | ((node: TreeSelectNode<T>) => Key),
      children: 'children' as
        | string
        | ((node: TreeSelectNode<T>) => Array<TreeSelectNode<T>> | undefined),
    },
    untrack(() => props.fieldNames),
  )
  const getLabel = (node: TreeSelectNode<T>): JSXElement => {
    const labelFieldName = fieldNames.label
    return typeof labelFieldName === 'function'
      ? labelFieldName(node)
      : unwrapStringOrJSXElement(get(node, labelFieldName) as StringOrJSXElement)
  }
  const getValue = (node: TreeSelectNode<T>): Key => {
    const valueFieldName = fieldNames.value
    return typeof valueFieldName === 'function' ? valueFieldName(node) : get(node, valueFieldName)
  }
  const getChildren = (node: TreeSelectNode<T>): Array<TreeSelectNode<T>> | undefined => {
    const childrenFieldName = fieldNames.children
    return typeof childrenFieldName === 'function'
      ? childrenFieldName(node)
      : get(node, childrenFieldName)
  }

  const optionMap = createMemo(() => {
    const map = new Map<Key, TreeSelectNode<T>>()

    const treeForEach = (list: Array<TreeSelectNode<T>> | undefined) => {
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

  const [value, setValue] = createControllableValue<Key | Key[] | undefined | null>(props)
  const valueArr = createMemo<Key[] | undefined | null>(() =>
    props.multiple
      ? (value() as Key[])
      : isNil(value())
        ? (value() as undefined | null)
        : ([value()] as Key[]),
  )
  const setValueArr = (v: Key[] | undefined) => {
    setValue(props.multiple ? v : v?.[0])
  }

  return (
    <SelectInput
      {...selectInputProps}
      labelRender={v =>
        props.labelRender
          ? props.labelRender(optionMap().get(v))
          : getLabel(optionMap().get(v)!) ?? v
      }
      value={valueArr()}
      onChange={setValueArr}
      content={close => (
        <Show when={!isEmpty(props.treeData)} fallback={<Empty.PRESENTED_IMAGE_SIMPLE />}>
          <div class="px-4px py-8px">
            <Tree
              multiple={props.multiple}
              blockNode
              fieldNames={{
                title: fieldNames.label,
                key: fieldNames.value,
                children: fieldNames.children,
              }}
              {...(props.checkable
                ? {
                  selectedKeys: [],
                  checkedKeys: valueArr(),
                  checkOnClick: true,
                  onCheck: checkedKeys => {
                    setValueArr(checkedKeys)
                  },
                }
                : {
                  selectedKeys: valueArr(),
                  onSelect: selectedKeys => {
                    setValueArr(selectedKeys)
                    if (!props.multiple) close()
                  },
                })}
              {...treeProps}
            />
          </div>
        </Show>
      )}
    />
  )
}

export default TreeSelect
