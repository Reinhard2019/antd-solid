import { type ParentProps } from 'solid-js'

interface CompactProps extends ParentProps {}

function Compact(props: CompactProps) {
  return (
    <div class="ant-compact flex child[:first-child]>:rounded-l-6px child[:last-child]>:rounded-r-6px">
      {props.children}
    </div>
  )
}

Compact.compactItemClass = 'p[.ant-compact]:ml--1px p[.ant-compact]:first:ml-0'
Compact.compactItemRounded0Class = 'p[.ant-compact]:rounded-0'
Compact.compactItemRoundedLeftClass = 'p[.ant-compact>:first-child]:rounded-l-6px'
Compact.compactItemRoundedRightClass = 'p[.ant-compact>:last-child]:rounded-r-6px'
Compact.compactItemZIndexClass =
  'p[.ant-compact]:hover:z-10 p[.ant-compact]:focus:z-10 p[.ant-compact]:focus-within:z-10'

export default Compact
