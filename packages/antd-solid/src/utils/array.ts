/**
 * 如果传入一个非数组字段，则将其转化为数组
 * @param value
 * @returns
 */
export function toArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value]
}

export interface StandardNode {
  children?: this[]
}
/**
 * 将数组中每个对象的 children 拍扁后返回
 * @param nodes
 * @returns
 */
export function flatChildren<T extends StandardNode = StandardNode>(nodes: T[] | undefined): T[] {
  if (!nodes) return []
  return nodes.flatMap(node => [node, ...flatChildren(node.children)])
}
