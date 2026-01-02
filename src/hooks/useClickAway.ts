import { type Accessor, onCleanup } from 'solid-js'
import { compact } from 'lodash-es'
import { toArray } from '../utils/array'

export default function useClickAway<T extends Event = Event>(
  onClickAway: (event: T) => void,
  target?: Accessor<Element | Element[] | undefined>,
) {
  const onClick = (event: Event) => {
    const targets = compact(target ? toArray(target()) : [])
    if (targets.every(item => !item.contains(event.target as Node))) {
      onClickAway(event as T)
    }
  }
  window.addEventListener('click', onClick, {
    capture: true,
  })
  onCleanup(() => {
    window.removeEventListener('click', onClick, {
      capture: true,
    })
  })
}
