/**
 * 减法 a-b
 * @param a
 * @param b
 * @returns
 */
export function subDOMPoint(a: DOMPoint, b: DOMPoint) {
  return new DOMPoint(a.x - b.x, a.y - b.y)
}
