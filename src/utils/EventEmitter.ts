type Subscription<T> = (val: T) => void

export default class EventEmitter<T> {
  private readonly subscriptions = new Set<Subscription<T>>()

  emit = (val: T) => {
    for (const subscription of this.subscriptions) {
      subscription(val)
    }
  }

  subscription = (callback: Subscription<T>) => {
    this.subscriptions.add(callback)
  }
}
