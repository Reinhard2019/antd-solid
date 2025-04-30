/**
 * 角度转弧度
 * @param degrees
 */
export function degToRad(degrees: number) {
  return (degrees / 180) * Math.PI
}

/**
 * 弧度转角度
 * @param degrees
 */
export function radToDeg(radian: number) {
  return (radian / Math.PI) * 180
}

/**
 * 获取两个点之间的距离
 * @param p1
 * @param p2
 * @returns
 */
export function distance(p1: DOMPoint, p2: DOMPoint) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}
