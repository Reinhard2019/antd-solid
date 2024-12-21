export function inRange(
  number: number,
  start: number,
  end: number,
  boundary: '()' | '[]' | '[)' | '(]' = '[)',
) {
  switch (boundary) {
    case '()':
      return number > start && number < end
    case '[]':
      return number >= start && number <= end
    case '[)':
      return number >= start && number < end
    case '(]':
      return number > start && number <= end
  }
}
