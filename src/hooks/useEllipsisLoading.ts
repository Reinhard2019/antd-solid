import { createSignal } from 'solid-js'

export default function useEllipsisLoading(time = 500) {
  const [ellipsis, setEllipsis] = createSignal('')

  setInterval(() => {
    setEllipsis(prev => (prev.length >= 3 ? '.' : prev + '.'))
  }, time)

  return ellipsis
}
