import { createContext } from 'solid-js'

export interface TooltipContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void
}

const TooltipContext = createContext<TooltipContextProps>()

export default TooltipContext
