import { createSignal, onCleanup } from 'solid-js'

export default function useMouse() {
  const [mouse, setMouse] = createSignal<MouseEvent>()

  const abortController = new AbortController()
  window.addEventListener(
    'mousemove',
    e => {
      setMouse(e)
    },
    {
      signal: abortController.signal,
    },
  )

  onCleanup(() => {
    abortController.abort()
  })

  return mouse
}
